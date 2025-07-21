const express = require('express');
const PDFDocument = require('pdfkit');
const { query } = require('../database/connection');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// GET /api/certificates - Get all certificates
router.get('/', authenticateToken, async (req, res) => {
  try {
    let queryText = `
      SELECT c.*, s.osi_data->>'artgEntry'->>'productName' as product_name,
             o.legal_name as organization_name
      FROM certificates c
      LEFT JOIN supplements s ON c.supplement_id = s.id
      LEFT JOIN organizations o ON s.organization_id = o.id
      ORDER BY c.created_at DESC
    `;
    let queryParams = [];

    // If not admin, only show certificates for user's supplements
    if (req.user.role !== 'admin') {
      queryText = `
        SELECT c.*, s.osi_data->>'artgEntry'->>'productName' as product_name,
               o.legal_name as organization_name
        FROM certificates c
        LEFT JOIN supplements s ON c.supplement_id = s.id
        LEFT JOIN organizations o ON s.organization_id = o.id
        WHERE s.created_by = $1
        ORDER BY c.created_at DESC
      `;
      queryParams = [req.user.id];
    }

    const result = await query(queryText, queryParams);

    res.json({
      certificates: result.rows
    });
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/certificates/:id - Get specific certificate
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    let queryText = `
      SELECT c.*, s.osi_data, s.status as supplement_status,
             o.legal_name as organization_name, o.trading_name
      FROM certificates c
      LEFT JOIN supplements s ON c.supplement_id = s.id
      LEFT JOIN organizations o ON s.organization_id = o.id
      WHERE c.id = $1
    `;
    let queryParams = [id];

    // If not admin, only allow access to own certificates
    if (req.user.role !== 'admin') {
      queryText += ' AND s.created_by = $2';
      queryParams.push(req.user.id);
    }

    const result = await query(queryText, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    res.json({
      certificate: result.rows[0]
    });
  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/certificates - Generate certificate (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { supplementId } = req.body;

    if (!supplementId) {
      return res.status(400).json({ error: 'Supplement ID is required' });
    }

    // Check if supplement exists and is approved
    const supplementResult = await query(`
      SELECT s.*, o.legal_name as organization_name
      FROM supplements s
      LEFT JOIN organizations o ON s.organization_id = o.id
      WHERE s.id = $1 AND s.status = 'approved'
    `, [supplementId]);

    if (supplementResult.rows.length === 0) {
      return res.status(404).json({ error: 'Approved supplement not found' });
    }

    const supplement = supplementResult.rows[0];

    // Check if certificate already exists
    const existingCert = await query(
      'SELECT id FROM certificates WHERE supplement_id = $1 AND status = $2',
      [supplementId, 'active']
    );

    if (existingCert.rows.length > 0) {
      return res.status(409).json({ error: 'Active certificate already exists for this supplement' });
    }

    // Generate OSI number (format: OSI-YYYY-NNNNNN)
    const year = new Date().getFullYear();
    const countResult = await query('SELECT COUNT(*) as count FROM certificates WHERE osi_number LIKE $1', [`OSI-${year}-%`]);
    const nextNumber = (parseInt(countResult.rows[0].count) + 1).toString().padStart(6, '0');
    const osiNumber = `OSI-${year}-${nextNumber}`;

    // Generate serial number
    const serialNumber = `${osiNumber}-${Date.now()}`;

    // Create verification URL (no QR code needed)
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${osiNumber}`;

    // Create certificate data
    const certificateData = {
      osiNumber,
      supplementId,
      productName: supplement.osi_data.artgEntry.productName,
      organizationName: supplement.organization_name,
      issuedDate: new Date().toISOString(),
      expiresDate: new Date(Date.now() + (2 * 365 * 24 * 60 * 60 * 1000)).toISOString(), // 2 years
      status: 'active',
      verificationUrl
    };

    // Generate digital signature using RSA-like approach (simplified for demo)
    const crypto = require('crypto');
    const dataToSign = `${osiNumber}|${supplement.osi_data.artgEntry.productName}|${supplement.organization_name}|${certificateData.issuedDate}`;
    const digitalSignature = crypto.createHash('sha256').update(dataToSign).digest('hex');

    // Calculate expiration date (2 years from now)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 2);

    // Insert certificate
    const result = await query(`
      INSERT INTO certificates (supplement_id, osi_number, serial_number, certificate_data, digital_signature, expires_at, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      supplementId,
      osiNumber,
      serialNumber,
      JSON.stringify(certificateData),
      digitalSignature,
      expiresAt,
      req.user.id
    ]);

    res.status(201).json({
      message: 'Certificate generated successfully',
      certificate: result.rows[0]
    });
  } catch (error) {
    console.error('Generate certificate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/certificates/:id/download - Download printable certificate PDF
router.get('/:id/download', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get certificate with supplement data
    let queryText = `
      SELECT c.*, s.osi_data, s.status as supplement_status,
             o.legal_name as organization_name, o.trading_name,
             o.address_line1, o.city, o.state, o.country
      FROM certificates c
      LEFT JOIN supplements s ON c.supplement_id = s.id
      LEFT JOIN organizations o ON s.organization_id = o.id
      WHERE c.id = $1
    `;
    let queryParams = [id];

    // If not admin, only allow access to own certificates
    if (req.user.role !== 'admin') {
      queryText += ' AND s.created_by = $2';
      queryParams.push(req.user.id);
    }

    const result = await query(queryText, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    const certificate = result.rows[0];
    const certData = JSON.parse(certificate.certificate_data);
    const osiData = certificate.osi_data;

    // Create PDF document
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="OSI-Certificate-${certData.osiNumber}.pdf"`);
    
    // Pipe PDF to response
    doc.pipe(res);

    // Add OSI header
    doc.fontSize(24).fillColor('#1976d2').text('Open Supplements Initiative', 50, 50);
    doc.fontSize(18).fillColor('#666').text('Certificate of Authenticity', 50, 80);
    
    // Add certificate number
    doc.fontSize(14).fillColor('#000').text(`Certificate Number: ${certData.osiNumber}`, 50, 120);
    
    // Add product information
    doc.fontSize(16).fillColor('#1976d2').text('Product Information', 50, 160);
    doc.fontSize(12).fillColor('#000')
       .text(`Product Name: ${certData.productName}`, 50, 185)
       .text(`Manufacturer: ${certData.organizationName}`, 50, 205)
       .text(`Dosage Form: ${osiData.components?.[0]?.dosageForm || 'Not specified'}`, 50, 225)
       .text(`Route of Administration: ${osiData.components?.[0]?.routeOfAdministration || 'Not specified'}`, 50, 245);

    // Add active ingredients
    if (osiData.components?.[0]?.activeIngredients?.length > 0) {
      doc.fontSize(16).fillColor('#1976d2').text('Active Ingredients', 50, 285);
      let yPos = 310;
      osiData.components[0].activeIngredients.forEach((ingredient, index) => {
        doc.fontSize(12).fillColor('#000')
           .text(`${index + 1}. ${ingredient.commonName || ingredient.name}`, 50, yPos)
           .text(`   Quantity: ${ingredient.quantity?.value || ''} ${ingredient.quantity?.unit || ''}`, 50, yPos + 15);
        yPos += 35;
      });
    }

    // Add certificate details
    const certYPos = Math.max(450, 310 + (osiData.components?.[0]?.activeIngredients?.length || 0) * 35);
    doc.fontSize(16).fillColor('#1976d2').text('Certificate Details', 50, certYPos);
    doc.fontSize(12).fillColor('#000')
       .text(`Issued Date: ${new Date(certData.issuedDate).toLocaleDateString()}`, 50, certYPos + 25)
       .text(`Expires Date: ${new Date(certData.expiresDate).toLocaleDateString()}`, 50, certYPos + 45)
       .text(`Status: ${certificate.status.toUpperCase()}`, 50, certYPos + 65)
       .text(`Digital Signature: ${certificate.digital_signature.substring(0, 32)}...`, 50, certYPos + 85);

    // Add verification instructions
    const verifyYPos = certYPos + 120;
    doc.fontSize(14).fillColor('#1976d2').text('Certificate Verification', 50, verifyYPos);
    doc.fontSize(10).fillColor('#666')
       .text('To verify this certificate, visit:', 50, verifyYPos + 20)
       .text(certData.verificationUrl, 50, verifyYPos + 35)
       .text(`Or enter OSI number: ${certData.osiNumber}`, 50, verifyYPos + 50);

    // Add footer
    doc.fontSize(10).fillColor('#666')
       .text('This certificate is cryptographically signed and can be verified at verify.osi.org', 50, 750)
       .text('© Open Supplements Initiative - Ensuring supplement transparency and trust', 50, 765);

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Download certificate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/certificates/:id/revoke - Revoke certificate (admin only)
router.put('/:id/revoke', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const result = await query(`
      UPDATE certificates 
      SET status = 'revoked', revoked_at = CURRENT_TIMESTAMP, revocation_reason = $1
      WHERE id = $2 AND status = 'active'
      RETURNING *
    `, [reason, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Active certificate not found' });
    }

    res.json({
      message: 'Certificate revoked successfully',
      certificate: result.rows[0]
    });
  } catch (error) {
    console.error('Revoke certificate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
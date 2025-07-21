const express = require('express');
const { query } = require('../database/connection');
const router = express.Router();

// GET /api/public/supplements - Get all certified supplements (public access)
router.get('/supplements', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let queryText = `
      SELECT s.id, s.osi_data, c.osi_number, c.issued_at, c.expires_at, c.status as cert_status,
             o.legal_name as organization_name, o.trading_name
      FROM supplements s
      INNER JOIN certificates c ON s.id = c.supplement_id
      LEFT JOIN organizations o ON s.organization_id = o.id
      WHERE s.status = 'approved' AND c.status = 'active'
    `;
    let queryParams = [];
    let paramCount = 0;

    // Add search functionality
    if (search) {
      queryText += ` AND (
        s.osi_data->>'artgEntry'->>'productName' ILIKE $${++paramCount} OR
        o.legal_name ILIKE $${++paramCount} OR
        c.osi_number ILIKE $${++paramCount}
      )`;
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
    }

    queryText += ` ORDER BY c.issued_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    queryParams.push(limit, offset);

    const result = await query(queryText, queryParams);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM supplements s
      INNER JOIN certificates c ON s.id = c.supplement_id
      LEFT JOIN organizations o ON s.organization_id = o.id
      WHERE s.status = 'approved' AND c.status = 'active'
    `;
    let countParams = [];

    if (search) {
      countQuery += ` AND (
        s.osi_data->>'artgEntry'->>'productName' ILIKE $1 OR
        o.legal_name ILIKE $2 OR
        c.osi_number ILIKE $3
      )`;
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern, searchPattern);
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      supplements: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get public supplements error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/public/supplements/:id - Get specific certified supplement (public access)
router.get('/supplements/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT s.id, s.osi_data, c.osi_number, c.issued_at, c.expires_at, c.status as cert_status,
             o.legal_name as organization_name, o.trading_name,
             o.address_line1, o.city, o.state, o.country
      FROM supplements s
      INNER JOIN certificates c ON s.id = c.supplement_id
      LEFT JOIN organizations o ON s.organization_id = o.id
      WHERE s.id = $1 AND s.status = 'approved' AND c.status = 'active'
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Certified supplement not found' });
    }

    res.json({
      supplement: result.rows[0]
    });
  } catch (error) {
    console.error('Get public supplement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/public/verify/:osiNumber - Verify certificate by OSI number (public access)
router.get('/verify/:osiNumber', async (req, res) => {
  try {
    const { osiNumber } = req.params;

    const result = await query(`
      SELECT c.id, c.osi_number, c.issued_at, c.expires_at, c.status, c.revoked_at, c.revocation_reason,
             s.osi_data->'artgEntry'->>'productName' as product_name,
             o.legal_name as organization_name, o.trading_name
      FROM certificates c
      LEFT JOIN supplements s ON c.supplement_id = s.id
      LEFT JOIN organizations o ON s.organization_id = o.id
      WHERE c.osi_number = $1
    `, [osiNumber]);

    let verificationResult;
    let certificateId = null;

    if (result.rows.length === 0) {
      verificationResult = 'not_found';
    } else {
      const certificate = result.rows[0];
      certificateId = certificate.id;
      const now = new Date();
      const expiresAt = new Date(certificate.expires_at);
      
      if (certificate.status === 'active' && expiresAt > now) {
        verificationResult = 'valid';
      } else if (certificate.status === 'expired' || expiresAt <= now) {
        verificationResult = 'expired';
      } else if (certificate.status === 'revoked') {
        verificationResult = 'revoked';
      }
    }

    // Log verification attempt for audit purposes
    try {
      const clientIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 
                      (req.connection.socket ? req.connection.socket.remoteAddress : null);
      const userAgent = req.get('User-Agent') || '';

      await query(`
        INSERT INTO certificate_verifications (osi_number, certificate_id, verification_result, ip_address, user_agent)
        VALUES ($1, $2, $3, $4, $5)
      `, [osiNumber, certificateId, verificationResult, clientIp, userAgent]);
    } catch (logError) {
      console.error('Error logging verification:', logError);
      // Don't fail the verification if logging fails
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Certificate not found',
        valid: false,
        status: 'not_found',
        message: 'Certificate not found'
      });
    }

    const certificate = result.rows[0];
    const now = new Date();
    const expiresAt = new Date(certificate.expires_at);
    
    let valid = false;
    let status = certificate.status;
    let message = '';

    if (certificate.status === 'active' && expiresAt > now) {
      valid = true;
      message = 'Certificate is valid and active';
    } else if (certificate.status === 'expired' || expiresAt <= now) {
      status = 'expired';
      message = 'Certificate has expired';
    } else if (certificate.status === 'revoked') {
      message = `Certificate has been revoked: ${certificate.revocation_reason}`;
    }

    res.json({
      valid,
      status,
      message,
      certificate: {
        osiNumber: certificate.osi_number,
        productName: certificate.product_name,
        organizationName: certificate.organization_name,
        issuedAt: certificate.issued_at,
        expiresAt: certificate.expires_at,
        revokedAt: certificate.revoked_at,
        revocationReason: certificate.revocation_reason
      }
    });
  } catch (error) {
    console.error('Verify certificate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/public/certificates/:osiNumber/download - Download certificate PDF by OSI number (public access)
router.get('/certificates/:osiNumber/download', async (req, res) => {
  try {
    const { osiNumber } = req.params;

    // Get certificate with supplement data
    const result = await query(`
      SELECT c.*, s.osi_data, s.status as supplement_status,
             o.legal_name as organization_name, o.trading_name,
             o.address_line1, o.city, o.state, o.country
      FROM certificates c
      LEFT JOIN supplements s ON c.supplement_id = s.id
      LEFT JOIN organizations o ON s.organization_id = o.id
      WHERE c.osi_number = $1 AND c.status = 'active'
    `, [osiNumber]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    const certificate = result.rows[0];
    const certData = JSON.parse(certificate.certificate_data);
    const osiData = certificate.osi_data;

    // Create PDF document
    const PDFDocument = require('pdfkit');
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
    console.error('Download public certificate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/public/stats - Get platform statistics (public access)
router.get('/stats', async (req, res) => {
  try {
    const [
      totalSupplements,
      activeCertificates,
      totalOrganizations,
      recentCertifications
    ] = await Promise.all([
      query('SELECT COUNT(*) as count FROM supplements WHERE status = $1', ['approved']),
      query('SELECT COUNT(*) as count FROM certificates WHERE status = $1', ['active']),
      query('SELECT COUNT(*) as count FROM organizations WHERE is_verified = $1', [true]),
      query(`
        SELECT COUNT(*) as count 
        FROM certificates 
        WHERE status = 'active' AND issued_at >= NOW() - INTERVAL '30 days'
      `)
    ]);

    res.json({
      stats: {
        totalCertifiedSupplements: parseInt(totalSupplements.rows[0].count),
        activeCertificates: parseInt(activeCertificates.rows[0].count),
        verifiedOrganizations: parseInt(totalOrganizations.rows[0].count),
        recentCertifications: parseInt(recentCertifications.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
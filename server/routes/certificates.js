const express = require('express');
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

    // Create certificate data
    const certificateData = {
      osiNumber,
      supplementId,
      productName: supplement.osi_data.artgEntry.productName,
      organizationName: supplement.organization_name,
      issuedDate: new Date().toISOString(),
      expiresDate: new Date(Date.now() + (2 * 365 * 24 * 60 * 60 * 1000)).toISOString(), // 2 years
      status: 'active'
    };

    // TODO: Generate actual digital signature
    const digitalSignature = `SIGNATURE_${serialNumber}_${Date.now()}`;

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
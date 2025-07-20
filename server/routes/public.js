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
             c.qr_code_url, o.legal_name as organization_name, o.trading_name,
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
      SELECT c.osi_number, c.issued_at, c.expires_at, c.status, c.revoked_at, c.revocation_reason,
             s.osi_data->>'artgEntry'->>'productName' as product_name,
             o.legal_name as organization_name, o.trading_name
      FROM certificates c
      LEFT JOIN supplements s ON c.supplement_id = s.id
      LEFT JOIN organizations o ON s.organization_id = o.id
      WHERE c.osi_number = $1
    `, [osiNumber]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Certificate not found',
        valid: false
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
const express = require('express');
const { query } = require('../database/connection');
const { authenticateToken, requireAdminOrManufacturer } = require('../middleware/auth');
const router = express.Router();

// GET /api/organizations - Get organizations (admin can see all, users see their own)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let queryText;
    let queryParams;

    if (req.user.role === 'admin') {
      // Admins can see all organizations
      queryText = `
        SELECT o.*, u.first_name, u.last_name, u.email as creator_email,
               COUNT(s.id) as supplement_count
        FROM organizations o
        LEFT JOIN users u ON o.created_by = u.id
        LEFT JOIN supplements s ON o.id = s.organization_id
        GROUP BY o.id, u.first_name, u.last_name, u.email
        ORDER BY o.created_at DESC
      `;
      queryParams = [];
    } else {
      // Users can only see organizations they created
      queryText = `
        SELECT o.*, COUNT(s.id) as supplement_count
        FROM organizations o
        LEFT JOIN supplements s ON o.id = s.organization_id
        WHERE o.created_by = $1
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `;
      queryParams = [req.user.id];
    }

    const result = await query(queryText, queryParams);

    res.json({
      organizations: result.rows
    });
  } catch (error) {
    console.error('Get organizations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/organizations/:id - Get specific organization
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    let queryText = `
      SELECT o.*, u.first_name, u.last_name, u.email as creator_email
      FROM organizations o
      LEFT JOIN users u ON o.created_by = u.id
      WHERE o.id = $1
    `;
    let queryParams = [id];

    // If not admin, only allow access to own organizations
    if (req.user.role !== 'admin') {
      queryText += ' AND o.created_by = $2';
      queryParams.push(req.user.id);
    }

    const result = await query(queryText, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.json({
      organization: result.rows[0]
    });
  } catch (error) {
    console.error('Get organization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/organizations - Create new organization
router.post('/', authenticateToken, requireAdminOrManufacturer, async (req, res) => {
  try {
    const {
      legalName,
      tradingName,
      registrationNumber,
      addressLine1,
      addressLine2,
      city,
      state,
      country,
      postalCode,
      phone,
      email,
      website
    } = req.body;

    if (!legalName) {
      return res.status(400).json({ error: 'Legal name is required' });
    }

    // Check if user already has an organization
    const existingOrg = await query(
      'SELECT id FROM organizations WHERE created_by = $1',
      [req.user.id]
    );

    if (existingOrg.rows.length > 0 && req.user.role !== 'admin') {
      return res.status(409).json({ error: 'You can only create one organization per account' });
    }

    const result = await query(`
      INSERT INTO organizations (
        legal_name, trading_name, registration_number, address_line1, address_line2,
        city, state, country, postal_code, phone, email, website, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      legalName, tradingName, registrationNumber, addressLine1, addressLine2,
      city, state, country, postalCode, phone, email, website, req.user.id
    ]);

    res.status(201).json({
      message: 'Organization created successfully',
      organization: result.rows[0]
    });
  } catch (error) {
    console.error('Create organization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/organizations/:id - Update organization
router.put('/:id', authenticateToken, requireAdminOrManufacturer, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      legalName,
      tradingName,
      registrationNumber,
      addressLine1,
      addressLine2,
      city,
      state,
      country,
      postalCode,
      phone,
      email,
      website,
      isVerified
    } = req.body;

    let queryText = `
      UPDATE organizations SET
        legal_name = $1, trading_name = $2, registration_number = $3,
        address_line1 = $4, address_line2 = $5, city = $6, state = $7,
        country = $8, postal_code = $9, phone = $10, email = $11,
        website = $12, updated_at = CURRENT_TIMESTAMP
    `;
    let queryParams = [
      legalName, tradingName, registrationNumber, addressLine1, addressLine2,
      city, state, country, postalCode, phone, email, website
    ];
    let paramCount = 12;

    // Only admins can update verification status
    if (isVerified !== undefined && req.user.role === 'admin') {
      queryText += `, is_verified = $${++paramCount}`;
      queryParams.push(isVerified);
    }

    queryText += ` WHERE id = $${++paramCount}`;
    queryParams.push(id);

    // If not admin, only allow updating own organizations
    if (req.user.role !== 'admin') {
      queryText += ` AND created_by = $${++paramCount}`;
      queryParams.push(req.user.id);
    }

    queryText += ' RETURNING *';

    const result = await query(queryText, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found or access denied' });
    }

    res.json({
      message: 'Organization updated successfully',
      organization: result.rows[0]
    });
  } catch (error) {
    console.error('Update organization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/organizations/my/profile - Get current user's organization
router.get('/my/profile', authenticateToken, async (req, res) => {
  try {
    const result = await query(`
      SELECT o.*, COUNT(s.id) as supplement_count
      FROM organizations o
      LEFT JOIN supplements s ON o.id = s.organization_id
      WHERE o.created_by = $1
      GROUP BY o.id
    `, [req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No organization found for this user' });
    }

    res.json({
      organization: result.rows[0]
    });
  } catch (error) {
    console.error('Get my organization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
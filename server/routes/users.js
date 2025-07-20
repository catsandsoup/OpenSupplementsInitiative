const express = require('express');
const { query } = require('../database/connection');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// GET /api/users - Get all users (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await query(`
      SELECT id, email, role, first_name, last_name, company_name, is_active, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.json({
      users: result.rows
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/profile - Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await query(`
      SELECT u.id, u.email, u.role, u.first_name, u.last_name, u.company_name, u.phone, u.is_active, u.created_at,
             o.id as organization_id, o.legal_name, o.trading_name, o.is_verified
      FROM users u
      LEFT JOIN organizations o ON o.created_by = u.id
      WHERE u.id = $1
    `, [req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/users/profile - Update current user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, companyName, phone } = req.body;

    const result = await query(`
      UPDATE users 
      SET first_name = $1, last_name = $2, company_name = $3, phone = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING id, email, role, first_name, last_name, company_name, phone, is_active, updated_at
    `, [firstName, lastName, companyName, phone, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
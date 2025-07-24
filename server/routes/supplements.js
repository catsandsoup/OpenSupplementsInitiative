const express = require('express');
const { query } = require('../database/connection');
const { authenticateToken, requireAdminOrManufacturer } = require('../middleware/auth');
const { validateSupplementData } = require('../validation/osi-schema');
const router = express.Router();

// GET /api/supplements - Get supplements (filtered by user role)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let queryText;
    let queryParams;

    if (req.user.role === 'admin') {
      // Admins can see all supplements
      queryText = `
        SELECT s.id, s.osi_data, s.status, s.submitted_at, s.reviewed_at, s.review_notes,
               o.legal_name as organization_name, o.trading_name,
               u.first_name, u.last_name
        FROM supplements s
        LEFT JOIN organizations o ON s.organization_id = o.id
        LEFT JOIN users u ON s.created_by = u.id
        ORDER BY s.created_at DESC
      `;
      queryParams = [];
    } else {
      // Manufacturers can only see their own supplements
      queryText = `
        SELECT s.id, s.osi_data, s.status, s.submitted_at, s.reviewed_at, s.review_notes,
               o.legal_name as organization_name, o.trading_name
        FROM supplements s
        LEFT JOIN organizations o ON s.organization_id = o.id
        WHERE s.created_by = $1
        ORDER BY s.created_at DESC
      `;
      queryParams = [req.user.id];
    }

    const result = await query(queryText, queryParams);

    // Normalize warnings data for all supplements to prevent React child object errors
    result.rows.forEach(supplement => {
      if (supplement.osi_data && supplement.osi_data.warnings) {
        supplement.osi_data.warnings = supplement.osi_data.warnings.map(warning => {
          if (typeof warning === 'string') {
            return warning;
          } else if (warning && typeof warning === 'object') {
            return warning.text || warning.warning || 'Warning information not available';
          }
          return 'Warning information not available';
        });
      }

      // Also handle structuredWarnings if they exist
      if (supplement.osi_data && supplement.osi_data.structuredWarnings) {
        // If we have structured warnings but no regular warnings, convert them
        if (!supplement.osi_data.warnings || supplement.osi_data.warnings.length === 0) {
          supplement.osi_data.warnings = supplement.osi_data.structuredWarnings.map(warning => {
            if (typeof warning === 'string') {
              return warning;
            } else if (warning && typeof warning === 'object') {
              return warning.text || warning.warning || 'Warning information not available';
            }
            return 'Warning information not available';
          });
        }
      }
    });

    res.json({
      supplements: result.rows
    });
  } catch (error) {
    console.error('Get supplements error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/supplements/:id - Get specific supplement
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    let queryText = `
      SELECT s.*, o.legal_name as organization_name, o.trading_name,
             u.first_name, u.last_name, u.email as creator_email
      FROM supplements s
      LEFT JOIN organizations o ON s.organization_id = o.id
      LEFT JOIN users u ON s.created_by = u.id
      WHERE s.id = $1
    `;
    let queryParams = [id];

    // If not admin, only allow access to own supplements
    if (req.user.role !== 'admin') {
      queryText += ' AND s.created_by = $2';
      queryParams.push(req.user.id);
    }

    const result = await query(queryText, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Supplement not found' });
    }

    const supplement = result.rows[0];
    
    // Normalize warnings data to prevent React child object errors
    if (supplement.osi_data && supplement.osi_data.warnings) {
      supplement.osi_data.warnings = supplement.osi_data.warnings.map(warning => {
        if (typeof warning === 'string') {
          return warning;
        } else if (warning && typeof warning === 'object') {
          return warning.text || warning.warning || 'Warning information not available';
        }
        return 'Warning information not available';
      });
    }

    // Also handle structuredWarnings if they exist
    if (supplement.osi_data && supplement.osi_data.structuredWarnings) {
      // If we have structured warnings but no regular warnings, convert them
      if (!supplement.osi_data.warnings || supplement.osi_data.warnings.length === 0) {
        supplement.osi_data.warnings = supplement.osi_data.structuredWarnings.map(warning => {
          if (typeof warning === 'string') {
            return warning;
          } else if (warning && typeof warning === 'object') {
            return warning.text || warning.warning || 'Warning information not available';
          }
          return 'Warning information not available';
        });
      }
    }

    res.json({
      supplement: supplement
    });
  } catch (error) {
    console.error('Get supplement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/supplements - Create new supplement
router.post('/', authenticateToken, requireAdminOrManufacturer, async (req, res) => {
  try {
    const formData = req.body;

    if (!formData) {
      return res.status(400).json({ error: 'Form data is required' });
    }

    // Extract OSI data from form data
    const osiData = {
      artgEntry: formData.artgEntry,
      conditions: formData.conditions || [],
      products: formData.products,
      permittedIndications: formData.permittedIndications,
      indicationRequirements: formData.indicationRequirements || [],
      standardIndications: formData.standardIndications || '',
      specificIndications: formData.specificIndications || '',
      warnings: formData.warnings,
      dosageInformation: formData.dosageInformation,
      allergenInformation: formData.allergenInformation,
      additionalProductInformation: formData.additionalProductInformation,
      components: formData.components,
      clinicalTrials: formData.clinicalTrials || [],
      evidenceRegulatorySummary: formData.evidenceRegulatorySummary || {},
      interactions: formData.interactions || [],
      contraindicationsAdverseEffects: formData.contraindicationsAdverseEffects || {},
      intendedPopulation: formData.intendedPopulation || {},
      storageShelfLife: formData.storageShelfLife,
      productIdentifiers: formData.productIdentifiers || [],
      documentInformation: formData.documentInformation
    };

    const organizationId = formData.submissionMetadata?.organizationId || null;
    const status = formData.submissionMetadata?.status || 'draft';

    // Use appropriate validation based on status
    const isDraft = status === 'draft';
    const validation = validateSupplementData(osiData, isDraft);
    
    if (!validation.valid) {
      return res.status(400).json({ 
        error: isDraft ? 'Invalid draft data format' : 'Invalid OSI data format',
        validationErrors: validation.errors
      });
    }

    const result = await query(`
      INSERT INTO supplements (osi_data, organization_id, created_by, status)
      VALUES ($1, $2, $3, $4)
      RETURNING id, osi_data, status, created_at
    `, [JSON.stringify(osiData), organizationId, req.user.id, status]);

    res.status(201).json({
      message: 'Supplement created successfully',
      supplement: result.rows[0],
      id: result.rows[0].id
    });
  } catch (error) {
    console.error('Create supplement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/supplements/:id - Update supplement
router.put('/:id', authenticateToken, requireAdminOrManufacturer, async (req, res) => {
  try {
    const { id } = req.params;
    const { osiData, status, reviewNotes } = req.body;

    let queryText = 'UPDATE supplements SET updated_at = CURRENT_TIMESTAMP';
    let queryParams = [];
    let paramCount = 0;

    if (osiData) {
      // For draft updates, use more lenient validation
      const isDraft = status === 'draft' || req.body.submissionMetadata?.status === 'draft';
      
      const validation = validateSupplementData(osiData, isDraft);
      if (!validation.valid) {
        return res.status(400).json({ 
          error: isDraft ? 'Invalid draft data format' : 'Invalid OSI data format',
          validationErrors: validation.errors
        });
      }
      queryText += `, osi_data = $${++paramCount}`;
      queryParams.push(JSON.stringify(osiData));
    }

    if (status && req.user.role === 'admin') {
      queryText += `, status = $${++paramCount}`;
      queryParams.push(status);
      
      if (status === 'approved' || status === 'rejected') {
        queryText += `, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = $${++paramCount}`;
        queryParams.push(req.user.id);
      }
    }

    if (reviewNotes && req.user.role === 'admin') {
      queryText += `, review_notes = $${++paramCount}`;
      queryParams.push(reviewNotes);
    }

    queryText += ` WHERE id = $${++paramCount}`;
    queryParams.push(id);

    // If not admin, only allow updating own supplements
    if (req.user.role !== 'admin') {
      queryText += ` AND created_by = $${++paramCount}`;
      queryParams.push(req.user.id);
    }

    queryText += ' RETURNING *';

    const result = await query(queryText, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Supplement not found or access denied' });
    }

    const updatedSupplement = result.rows[0];

    // Auto-generate certificate when supplement is approved
    if (status === 'approved' && req.user.role === 'admin') {
      try {
        // Check if certificate already exists
        const existingCert = await query(
          'SELECT id FROM certificates WHERE supplement_id = $1 AND status = $2',
          [id, 'active']
        );

        if (existingCert.rows.length === 0) {
          // Generate certificate automatically
          const certificateResponse = await fetch(`${process.env.API_BASE_URL || 'http://localhost:3001'}/api/certificates`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': req.headers.authorization
            },
            body: JSON.stringify({ supplementId: id })
          });

          if (certificateResponse.ok) {
            console.log(`Certificate generated automatically for supplement ${id}`);
          }
        }
      } catch (certError) {
        console.error('Error auto-generating certificate:', certError);
        // Don't fail the supplement update if certificate generation fails
      }
    }

    res.json({
      message: 'Supplement updated successfully',
      supplement: updatedSupplement
    });
  } catch (error) {
    console.error('Update supplement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/supplements/submit - Submit new supplement for review
router.post('/submit', authenticateToken, requireAdminOrManufacturer, async (req, res) => {
  try {
    const formData = req.body;

    if (!formData) {
      return res.status(400).json({ error: 'Form data is required' });
    }

    // Extract OSI data from form data
    const osiData = {
      artgEntry: formData.artgEntry,
      conditions: formData.conditions || [],
      products: formData.products,
      permittedIndications: formData.permittedIndications,
      indicationRequirements: formData.indicationRequirements || [],
      standardIndications: formData.standardIndications || '',
      specificIndications: formData.specificIndications || '',
      warnings: formData.warnings,
      dosageInformation: formData.dosageInformation,
      allergenInformation: formData.allergenInformation,
      additionalProductInformation: formData.additionalProductInformation,
      components: formData.components,
      clinicalTrials: formData.clinicalTrials || [],
      evidenceRegulatorySummary: formData.evidenceRegulatorySummary || {},
      interactions: formData.interactions || [],
      contraindicationsAdverseEffects: formData.contraindicationsAdverseEffects || {},
      intendedPopulation: formData.intendedPopulation || {},
      storageShelfLife: formData.storageShelfLife,
      productIdentifiers: formData.productIdentifiers || [],
      documentInformation: formData.documentInformation
    };

    // Validate OSI data against schema
    const validation = validateSupplementData(osiData);
    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'Invalid OSI data format',
        validationErrors: validation.errors
      });
    }

    const organizationId = formData.submissionMetadata?.organizationId || req.user.organizationId;

    const result = await query(`
      INSERT INTO supplements (osi_data, organization_id, created_by, status, submitted_at)
      VALUES ($1, $2, $3, 'submitted', CURRENT_TIMESTAMP)
      RETURNING id, osi_data, status, created_at, submitted_at
    `, [JSON.stringify(osiData), organizationId, req.user.id]);

    res.status(201).json({
      message: 'Supplement submitted for review successfully',
      supplement: result.rows[0],
      id: result.rows[0].id
    });
  } catch (error) {
    console.error('Submit supplement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/supplements/:id/submit - Submit existing supplement for review
router.post('/:id/submit', authenticateToken, requireAdminOrManufacturer, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      UPDATE supplements 
      SET status = 'submitted', submitted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND created_by = $2 AND status = 'draft'
      RETURNING *
    `, [id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Supplement not found or cannot be submitted' });
    }

    res.json({
      message: 'Supplement submitted for review successfully',
      supplement: result.rows[0]
    });
  } catch (error) {
    console.error('Submit supplement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
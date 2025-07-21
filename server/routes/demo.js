const express = require('express');
const router = express.Router();
const { query } = require('../database/connection');
const auth = require('../middleware/auth');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');

// Middleware to ensure admin access
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get demo status
router.get('/status', auth, requireAdmin, async (req, res) => {
  try {
    // Check if demo mode settings exist in database or use defaults
    const result = await query(`
      SELECT setting_key, setting_value 
      FROM system_settings 
      WHERE setting_key IN ('demo_mode', 'presentation_mode', 'accelerated_mode')
    `);
    
    const settings = {};
    result.rows.forEach(row => {
      settings[row.setting_key] = row.setting_value === 'true';
    });

    res.json({
      demoMode: settings.demo_mode || false,
      presentationMode: settings.presentation_mode || false,
      acceleratedMode: settings.accelerated_mode || false
    });
  } catch (error) {
    console.error('Error getting demo status:', error);
    res.status(500).json({ error: 'Failed to get demo status' });
  }
});

// Get demo statistics
router.get('/stats', auth, requireAdmin, async (req, res) => {
  try {
    const [productsResult, usersResult, demosResult] = await Promise.all([
      query('SELECT COUNT(*) as count FROM supplements WHERE created_at > NOW() - INTERVAL \'7 days\''),
      query('SELECT COUNT(*) as count FROM users WHERE last_login > NOW() - INTERVAL \'1 hour\''),
      query('SELECT COUNT(*) as count FROM audit_logs WHERE action = \'demo_completed\' AND created_at > NOW() - INTERVAL \'1 day\'')
    ]);

    // System health check
    const healthCheck = await query('SELECT 1');
    const systemHealth = healthCheck.rows.length > 0 ? 'good' : 'error';

    res.json({
      stats: {
        totalProducts: parseInt(productsResult.rows[0].count),
        activeUsers: parseInt(usersResult.rows[0].count),
        completedDemos: parseInt(demosResult.rows[0].count),
        systemHealth
      }
    });
  } catch (error) {
    console.error('Error getting demo stats:', error);
    res.status(500).json({ error: 'Failed to get demo statistics' });
  }
});

// Get demo scenarios
router.get('/scenarios', auth, requireAdmin, async (req, res) => {
  try {
    const scenarios = [
      {
        id: 'full-workflow',
        name: 'Complete Workflow Demo',
        description: 'Full end-to-end demonstration from submission to certification'
      },
      {
        id: 'manufacturer-submission',
        name: 'Manufacturer Submission',
        description: 'Demonstrate product submission process'
      },
      {
        id: 'admin-review',
        name: 'Admin Review Process',
        description: 'Show admin review and approval workflow'
      },
      {
        id: 'certificate-generation',
        name: 'Certificate Generation',
        description: 'Demonstrate certificate creation and QR code generation'
      },
      {
        id: 'public-verification',
        name: 'Public Verification',
        description: 'Show public catalog and certificate verification'
      }
    ];

    res.json({ scenarios });
  } catch (error) {
    console.error('Error getting demo scenarios:', error);
    res.status(500).json({ error: 'Failed to get demo scenarios' });
  }
});

// Reset demo data
router.post('/reset', auth, requireAdmin, async (req, res) => {
  try {
    // Begin transaction
    await query('BEGIN');

    // Delete demo data (keep system accounts)
    await query(`
      DELETE FROM certificates 
      WHERE supplement_id IN (
        SELECT id FROM supplements 
        WHERE created_by IN (
          SELECT id FROM users 
          WHERE email LIKE '%demo%' OR email LIKE '%test%'
        )
      )
    `);

    await query(`
      DELETE FROM documents 
      WHERE supplement_id IN (
        SELECT id FROM supplements 
        WHERE created_by IN (
          SELECT id FROM users 
          WHERE email LIKE '%demo%' OR email LIKE '%test%'
        )
      )
    `);

    await query(`
      DELETE FROM supplements 
      WHERE created_by IN (
        SELECT id FROM users 
        WHERE email LIKE '%demo%' OR email LIKE '%test%'
      )
    `);

    // Reset demo user organizations
    await query(`
      UPDATE organizations 
      SET verification_status = 'pending',
          updated_at = NOW()
      WHERE created_by IN (
        SELECT id FROM users 
        WHERE email LIKE '%demo%' OR email LIKE '%test%'
      )
    `);

    // Create fresh demo data
    await createDemoData();

    // Commit transaction
    await query('COMMIT');

    // Log the reset action
    await query(`
      INSERT INTO audit_logs (user_id, action, details, created_at)
      VALUES ($1, 'demo_reset', 'Demo data reset by admin', NOW())
    `, [req.user.id]);

    res.json({ message: 'Demo data reset successfully' });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error resetting demo data:', error);
    res.status(500).json({ error: 'Failed to reset demo data' });
  }
});

// Toggle demo mode
router.post('/mode', auth, requireAdmin, async (req, res) => {
  try {
    const { demoMode } = req.body;
    
    await query(`
      INSERT INTO system_settings (setting_key, setting_value, updated_at)
      VALUES ('demo_mode', $1, NOW())
      ON CONFLICT (setting_key)
      DO UPDATE SET setting_value = $1, updated_at = NOW()
    `, [demoMode.toString()]);

    res.json({ message: `Demo mode ${demoMode ? 'enabled' : 'disabled'}` });
  } catch (error) {
    console.error('Error toggling demo mode:', error);
    res.status(500).json({ error: 'Failed to toggle demo mode' });
  }
});

// Toggle presentation mode
router.post('/presentation', auth, requireAdmin, async (req, res) => {
  try {
    const { presentationMode } = req.body;
    
    await query(`
      INSERT INTO system_settings (setting_key, setting_value, updated_at)
      VALUES ('presentation_mode', $1, NOW())
      ON CONFLICT (setting_key)
      DO UPDATE SET setting_value = $1, updated_at = NOW()
    `, [presentationMode.toString()]);

    res.json({ message: `Presentation mode ${presentationMode ? 'enabled' : 'disabled'}` });
  } catch (error) {
    console.error('Error toggling presentation mode:', error);
    res.status(500).json({ error: 'Failed to toggle presentation mode' });
  }
});

// Toggle accelerated mode
router.post('/accelerated', auth, requireAdmin, async (req, res) => {
  try {
    const { acceleratedMode } = req.body;
    
    await query(`
      INSERT INTO system_settings (setting_key, setting_value, updated_at)
      VALUES ('accelerated_mode', $1, NOW())
      ON CONFLICT (setting_key)
      DO UPDATE SET setting_value = $1, updated_at = NOW()
    `, [acceleratedMode.toString()]);

    res.json({ message: `Accelerated mode ${acceleratedMode ? 'enabled' : 'disabled'}` });
  } catch (error) {
    console.error('Error toggling accelerated mode:', error);
    res.status(500).json({ error: 'Failed to toggle accelerated mode' });
  }
});

// Run demo scenario
router.post('/scenarios/:scenarioId/run', auth, requireAdmin, async (req, res) => {
  try {
    const { scenarioId } = req.params;
    
    // Execute scenario-specific logic
    switch (scenarioId) {
      case 'full-workflow':
        await runFullWorkflowDemo();
        break;
      case 'manufacturer-submission':
        await runManufacturerSubmissionDemo();
        break;
      case 'admin-review':
        await runAdminReviewDemo();
        break;
      case 'certificate-generation':
        await runCertificateGenerationDemo();
        break;
      case 'public-verification':
        await runPublicVerificationDemo();
        break;
      default:
        return res.status(400).json({ error: 'Unknown scenario' });
    }

    // Log the scenario execution
    await query(`
      INSERT INTO audit_logs (user_id, action, details, created_at)
      VALUES ($1, 'demo_scenario_run', $2, NOW())
    `, [req.user.id, `Executed demo scenario: ${scenarioId}`]);

    res.json({ message: 'Demo scenario executed successfully' });
  } catch (error) {
    console.error('Error running demo scenario:', error);
    res.status(500).json({ error: 'Failed to run demo scenario' });
  }
});

// Export TGA submission package
router.post('/export/tga', auth, requireAdmin, async (req, res) => {
  try {
    // Get all approved supplements
    const supplements = await query(`
      SELECT s.*, c.osi_number, c.issued_at, c.expires_at,
             o.legal_name as organization_name
      FROM supplements s
      LEFT JOIN certificates c ON s.id = c.supplement_id
      LEFT JOIN organizations o ON s.organization_id = o.id
      WHERE s.status = 'approved'
      ORDER BY c.issued_at DESC
    `);

    // Create temporary directory for export
    const exportDir = path.join(__dirname, '../temp/tga-export');
    await fs.mkdir(exportDir, { recursive: true });

    // Generate TGA-formatted files
    for (const supplement of supplements.rows) {
      const tgaData = {
        productName: supplement.osi_data?.artgEntry?.productName,
        artgNumber: supplement.osi_data?.artgEntry?.artgNumber,
        sponsor: supplement.osi_data?.artgEntry?.sponsor,
        osiNumber: supplement.osi_number,
        certificationDate: supplement.issued_at,
        expiryDate: supplement.expires_at,
        ingredients: supplement.osi_data?.components?.[0]?.activeIngredients || [],
        dosageForm: supplement.osi_data?.components?.[0]?.dosageForm,
        indications: supplement.osi_data?.permittedIndications || [],
        warnings: supplement.osi_data?.warnings || [],
        organizationName: supplement.organization_name
      };

      const filename = `${supplement.osi_number || supplement.id}_TGA_Submission.json`;
      await fs.writeFile(
        path.join(exportDir, filename),
        JSON.stringify(tgaData, null, 2)
      );
    }

    // Create summary report
    const summaryReport = {
      exportDate: new Date().toISOString(),
      totalProducts: supplements.rows.length,
      exportedBy: req.user.email,
      products: supplements.rows.map(s => ({
        osiNumber: s.osi_number,
        productName: s.osi_data?.artgEntry?.productName,
        status: s.status,
        certificationDate: s.issued_at
      }))
    };

    await fs.writeFile(
      path.join(exportDir, 'TGA_Export_Summary.json'),
      JSON.stringify(summaryReport, null, 2)
    );

    // Create ZIP archive
    const archive = archiver('zip', { zlib: { level: 9 } });
    const zipPath = path.join(__dirname, '../temp', `OSI-TGA-Export-${Date.now()}.zip`);
    const output = require('fs').createWriteStream(zipPath);

    archive.pipe(output);
    archive.directory(exportDir, false);
    await archive.finalize();

    // Send the ZIP file
    res.download(zipPath, `OSI-TGA-Export-${new Date().toISOString().split('T')[0]}.zip`, async (err) => {
      if (err) {
        console.error('Error sending TGA export:', err);
      }
      
      // Clean up temporary files
      try {
        await fs.rm(exportDir, { recursive: true, force: true });
        await fs.unlink(zipPath);
      } catch (cleanupError) {
        console.error('Error cleaning up export files:', cleanupError);
      }
    });

  } catch (error) {
    console.error('Error creating TGA export:', error);
    res.status(500).json({ error: 'Failed to create TGA export package' });
  }
});

// Helper functions for demo scenarios
async function createDemoData() {
  // Create demo supplement data
  const demoSupplements = [
    {
      productName: 'Vitamin D3 Premium',
      sponsor: 'HealthSupplements Demo Co.',
      dosageForm: 'Capsule',
      status: 'approved'
    },
    {
      productName: 'Omega-3 Complex',
      sponsor: 'HealthSupplements Demo Co.',
      dosageForm: 'Softgel',
      status: 'under_review'
    },
    {
      productName: 'Multivitamin Plus',
      sponsor: 'HealthSupplements Demo Co.',
      dosageForm: 'Tablet',
      status: 'submitted'
    }
  ];

  // Insert demo supplements (simplified for demo purposes)
  for (const supplement of demoSupplements) {
    const osiData = {
      artgEntry: {
        productName: supplement.productName,
        sponsor: supplement.sponsor,
        productCategory: 'Medicine',
        status: 'Active'
      },
      components: [{
        dosageForm: supplement.dosageForm,
        activeIngredients: []
      }]
    };

    await query(`
      INSERT INTO supplements (osi_data, status, created_at, updated_at)
      VALUES ($1, $2, NOW(), NOW())
    `, [JSON.stringify(osiData), supplement.status]);
  }
}

async function runFullWorkflowDemo() {
  // Simulate full workflow by updating supplement statuses
  await query(`
    UPDATE supplements 
    SET status = 'approved', updated_at = NOW()
    WHERE status = 'under_review' 
    LIMIT 1
  `);
}

async function runManufacturerSubmissionDemo() {
  // Create a new demo submission
  await createDemoData();
}

async function runAdminReviewDemo() {
  // Move submitted supplements to under_review
  await query(`
    UPDATE supplements 
    SET status = 'under_review', updated_at = NOW()
    WHERE status = 'submitted'
  `);
}

async function runCertificateGenerationDemo() {
  // Generate certificates for approved supplements without them
  const supplements = await query(`
    SELECT id FROM supplements 
    WHERE status = 'approved' 
    AND id NOT IN (SELECT supplement_id FROM certificates)
    LIMIT 1
  `);

  for (const supplement of supplements.rows) {
    const osiNumber = `OSI-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`;
    
    await query(`
      INSERT INTO certificates (supplement_id, osi_number, status, issued_at, expires_at, created_at)
      VALUES ($1, $2, 'active', NOW(), NOW() + INTERVAL '2 years', NOW())
    `, [supplement.id, osiNumber]);
  }
}

async function runPublicVerificationDemo() {
  // Ensure there are public-visible approved supplements
  await query(`
    UPDATE supplements 
    SET status = 'approved', updated_at = NOW()
    WHERE status IN ('under_review', 'submitted')
    LIMIT 2
  `);
}

module.exports = router;
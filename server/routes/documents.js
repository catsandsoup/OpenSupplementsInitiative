const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { query } = require('../database/connection');
const { authenticateToken, requireAdminOrManufacturer } = require('../middleware/auth');
const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: (req, file, cb) => {
    // Allow common document types
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, images, and Word documents are allowed.'));
    }
  }
});

// Helper function to calculate file hash
const calculateFileHash = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
};

// GET /api/documents - Get documents for a supplement
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { supplementId } = req.query;

    if (!supplementId) {
      return res.status(400).json({ error: 'Supplement ID is required' });
    }

    // Check if user has access to this supplement
    let accessQuery = 'SELECT id FROM supplements WHERE id = $1';
    let accessParams = [supplementId];

    if (req.user.role !== 'admin') {
      accessQuery += ' AND created_by = $2';
      accessParams.push(req.user.id);
    }

    const accessResult = await query(accessQuery, accessParams);
    if (accessResult.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied to this supplement' });
    }

    // Get documents
    const result = await query(`
      SELECT d.*, u.first_name, u.last_name
      FROM documents d
      LEFT JOIN users u ON d.uploaded_by = u.id
      WHERE d.supplement_id = $1
      ORDER BY d.created_at DESC
    `, [supplementId]);

    res.json({
      documents: result.rows
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/documents/upload - Upload document
router.post('/upload', authenticateToken, requireAdminOrManufacturer, upload.single('file'), async (req, res) => {
  try {
    const { supplementId, category, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // For new submissions, supplementId might be 'new'
    let actualSupplementId = supplementId;
    if (supplementId !== 'new') {
      // Check if user has access to this supplement
      let accessQuery = 'SELECT id FROM supplements WHERE id = $1';
      let accessParams = [supplementId];

      if (req.user.role !== 'admin') {
        accessQuery += ' AND created_by = $2';
        accessParams.push(req.user.id);
      }

      const accessResult = await query(accessQuery, accessParams);
      if (accessResult.rows.length === 0) {
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        return res.status(403).json({ error: 'Access denied to this supplement' });
      }
    }

    // Calculate file hash
    const fileHash = await calculateFileHash(req.file.path);

    // For new submissions, we'll store the file temporarily
    // and associate it with the supplement when it's created
    const result = await query(`
      INSERT INTO documents (supplement_id, document_type, file_name, file_path, file_size, mime_type, file_hash, description, uploaded_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      actualSupplementId === 'new' ? null : actualSupplementId,
      category || 'other',
      req.file.originalname,
      req.file.path,
      req.file.size,
      req.file.mimetype,
      fileHash,
      description || '',
      req.user.id
    ]);

    // Generate a URL for the uploaded file
    const fileUrl = `/api/documents/${result.rows[0].id}/download`;

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: result.rows[0],
      id: result.rows[0].id,
      url: fileUrl
    });
  } catch (error) {
    console.error('Upload document error:', error);
    
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/documents/:id/download - Download document
router.get('/:id/download', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get document info and check access
    let queryText = `
      SELECT d.*, s.created_by as supplement_creator
      FROM documents d
      LEFT JOIN supplements s ON d.supplement_id = s.id
      WHERE d.id = $1
    `;
    let queryParams = [id];

    const result = await query(queryText, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const document = result.rows[0];

    // Check access permissions
    if (req.user.role !== 'admin' && document.supplement_creator !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if file exists
    if (!fs.existsSync(document.file_path)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', document.mime_type);
    res.setHeader('Content-Disposition', `attachment; filename="${document.file_name}"`);

    // Stream file to response
    const fileStream = fs.createReadStream(document.file_path);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/documents/:id - Delete document
router.delete('/:id', authenticateToken, requireAdminOrManufacturer, async (req, res) => {
  try {
    const { id } = req.params;

    // Get document info and check access
    let queryText = `
      SELECT d.*, s.created_by as supplement_creator
      FROM documents d
      LEFT JOIN supplements s ON d.supplement_id = s.id
      WHERE d.id = $1
    `;
    let queryParams = [id];

    const result = await query(queryText, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const document = result.rows[0];

    // Check access permissions
    if (req.user.role !== 'admin' && document.supplement_creator !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete from database
    await query('DELETE FROM documents WHERE id = $1', [id]);

    // Delete file from filesystem
    if (fs.existsSync(document.file_path)) {
      fs.unlinkSync(document.file_path);
    }

    res.json({
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
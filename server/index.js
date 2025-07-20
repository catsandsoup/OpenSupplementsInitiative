const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/organizations', require('./routes/organizations'));
app.use('/api/supplements', require('./routes/supplements'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/public', require('./routes/public'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// OSI validation test endpoint
app.post('/api/validate-osi', (req, res) => {
  const { validateSupplementData } = require('./validation/osi-schema');
  
  try {
    const { osiData } = req.body;
    
    if (!osiData) {
      return res.status(400).json({ error: 'OSI data is required' });
    }
    
    const validation = validateSupplementData(osiData);
    
    res.json({
      valid: validation.valid,
      errors: validation.errors,
      message: validation.valid ? 'OSI data is valid' : 'OSI data validation failed'
    });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ error: 'Validation service error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, async () => {
  console.log(`OSI Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  
  // Test database connection
  try {
    const { query } = require('./database/connection');
    await query('SELECT 1');
    console.log('Database connection successful');
  } catch (error) {
    console.error('Database connection failed:', error);
    console.error('Please ensure PostgreSQL is running and configured correctly');
  }
});

module.exports = app;
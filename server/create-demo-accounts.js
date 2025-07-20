const bcrypt = require('bcryptjs');
const { query } = require('./database/connection');
const { v4: uuidv4 } = require('uuid');

async function createDemoAccounts() {
  try {
    console.log('Creating additional demo accounts...');

    // Create a second manufacturer account
    const manufacturer2Password = await bcrypt.hash('demo123', 10);
    
    const manufacturer2Result = await query(`
      INSERT INTO users (id, email, password_hash, role, first_name, last_name, company_name, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `, [uuidv4(), 'demo2@naturalsupplements.com', manufacturer2Password, 'manufacturer', 'Sarah', 'Johnson', 'Natural Supplements Ltd.', true]);

    const manufacturer2Id = manufacturer2Result.rows[0].id;

    // Create organization for second manufacturer
    await query(`
      INSERT INTO organizations (id, legal_name, trading_name, registration_number, address_line1, city, state, country, postal_code, phone, email, website, is_verified, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT DO NOTHING
    `, [
      uuidv4(),
      'Natural Supplements Ltd.',
      'Natural Supplements',
      'ACN 987 654 321',
      '456 Organic Avenue',
      'Sydney',
      'NSW',
      'Australia',
      '2000',
      '+61 2 9000 0000',
      'info@naturalsupplements.com',
      'https://naturalsupplements.com',
      true,
      manufacturer2Id
    ]);

    console.log('Demo accounts created successfully!');
    console.log('Available accounts:');
    console.log('- Admin: admin@osi.org / admin123');
    console.log('- Manufacturer 1: demo@healthsupplements.com / manufacturer123');
    console.log('- Manufacturer 2: demo2@naturalsupplements.com / demo123');

  } catch (error) {
    console.error('Error creating demo accounts:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createDemoAccounts()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { createDemoAccounts };
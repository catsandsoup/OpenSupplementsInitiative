const bcrypt = require('bcryptjs');
const { query } = require('./connection');
const { v4: uuidv4 } = require('uuid');
const { generateOSIData, supplementProducts } = require('./osi-seed-data');

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Create demo users
    const adminPassword = await bcrypt.hash('admin123', 10);
    const manufacturerPassword = await bcrypt.hash('manufacturer123', 10);

    // Insert admin user
    const adminResult = await query(`
      INSERT INTO users (id, email, password_hash, role, first_name, last_name, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `, [uuidv4(), 'admin@osi.org', adminPassword, 'admin', 'OSI', 'Administrator', true]);

    // Insert demo manufacturer user
    const manufacturerResult = await query(`
      INSERT INTO users (id, email, password_hash, role, first_name, last_name, company_name, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `, [uuidv4(), 'demo@healthsupplements.com', manufacturerPassword, 'manufacturer', 'John', 'Smith', 'Health Supplements Co.', true]);

    const manufacturerId = manufacturerResult.rows[0].id;

    // Create demo organization
    const orgResult = await query(`
      INSERT INTO organizations (id, legal_name, trading_name, registration_number, address_line1, city, state, country, postal_code, phone, email, website, is_verified, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT DO NOTHING
      RETURNING id
    `, [
      uuidv4(),
      'Health Supplements Co. Pty Ltd',
      'Health Supplements Co.',
      'ACN 123 456 789',
      '123 Wellness Street',
      'Melbourne',
      'VIC',
      'Australia',
      '3000',
      '+61 3 9000 0000',
      'info@healthsupplements.com',
      'https://healthsupplements.com',
      true,
      manufacturerId
    ]);

    const organizationId = orgResult.rows[0]?.id;

    // Create multiple demo supplements using the OSI data structure
    if (organizationId) {
      for (const product of supplementProducts) {
        const osiData = generateOSIData(product);
        
        await query(`
          INSERT INTO supplements (id, osi_data, organization_id, status, created_by)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT DO NOTHING
        `, [
          uuidv4(),
          JSON.stringify(osiData),
          organizationId,
          'draft',
          manufacturerId
        ]);
      }
    }

    console.log('Database seeding completed successfully!');
    console.log('Demo accounts created:');
    console.log('- Admin: admin@osi.org / admin123');
    console.log('- Manufacturer: demo@healthsupplements.com / manufacturer123');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
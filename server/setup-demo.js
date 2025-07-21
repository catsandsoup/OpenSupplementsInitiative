#!/usr/bin/env node

const { createDemoData } = require('./database/demo-data');
const { createMockDocuments } = require('./database/mock-documents');
const { query } = require('./database/connection');

async function setupCompleteDemo() {
  console.log('🎬 Setting up complete OSI Platform demo...\n');
  
  try {
    // Step 1: Clear existing demo data
    console.log('🧹 Clearing existing demo data...');
    await clearDemoData();
    console.log('   ✅ Demo data cleared\n');

    // Step 2: Create comprehensive demo data
    console.log('📊 Creating comprehensive demo data...');
    await createDemoData();
    console.log('   ✅ Demo data created\n');

    // Step 3: Create mock documents
    console.log('📄 Creating mock supporting documents...');
    await createMockDocuments();
    console.log('   ✅ Mock documents created\n');

    // Step 4: Verify demo setup
    console.log('🔍 Verifying demo setup...');
    await verifyDemoSetup();
    console.log('   ✅ Demo setup verified\n');

    // Step 5: Display demo information
    displayDemoInfo();

  } catch (error) {
    console.error('❌ Error setting up demo:', error);
    process.exit(1);
  }
}

async function clearDemoData() {
  try {
    // Clear in correct order due to foreign key constraints
    await query('DELETE FROM certificate_verifications');
    await query('DELETE FROM certificates');
    await query('DELETE FROM documents');
    await query('DELETE FROM supplements');
    await query('DELETE FROM organizations');
    await query('DELETE FROM users WHERE email LIKE \'%@osi.org\' OR email LIKE \'%@healthsupplements.com\'');
    
    console.log('   🗑️  Cleared certificates, supplements, organizations, and demo users');
  } catch (error) {
    console.error('Error clearing demo data:', error);
    throw error;
  }
}

async function verifyDemoSetup() {
  try {
    // Check users
    const usersResult = await query('SELECT COUNT(*) as count FROM users WHERE email IN ($1, $2, $3)', [
      'admin@osi.org',
      'demo@healthsupplements.com', 
      'reviewer@osi.org'
    ]);
    console.log(`   👥 Demo users: ${usersResult.rows[0].count}/3`);

    // Check organizations
    const orgsResult = await query('SELECT COUNT(*) as count FROM organizations');
    console.log(`   🏢 Organizations: ${orgsResult.rows[0].count}`);

    // Check supplements
    const supplementsResult = await query(`
      SELECT status, COUNT(*) as count 
      FROM supplements 
      GROUP BY status 
      ORDER BY status
    `);
    
    console.log('   💊 Supplements by status:');
    supplementsResult.rows.forEach(row => {
      console.log(`      ${row.status}: ${row.count}`);
    });

    // Check certificates
    const certificatesResult = await query('SELECT COUNT(*) as count FROM certificates WHERE status = $1', ['active']);
    console.log(`   📜 Active certificates: ${certificatesResult.rows[0].count}`);

    // Check if we have at least one of each status
    const statusCounts = {};
    supplementsResult.rows.forEach(row => {
      statusCounts[row.status] = parseInt(row.count);
    });

    const requiredStatuses = ['draft', 'submitted', 'approved'];
    const missingStatuses = requiredStatuses.filter(status => !statusCounts[status]);
    
    if (missingStatuses.length > 0) {
      throw new Error(`Missing supplements with status: ${missingStatuses.join(', ')}`);
    }

    if (parseInt(certificatesResult.rows[0].count) === 0) {
      throw new Error('No active certificates found');
    }

  } catch (error) {
    console.error('Demo verification failed:', error);
    throw error;
  }
}

function displayDemoInfo() {
  console.log('🎉 OSI Platform Demo Setup Complete!\n');
  
  console.log('📋 DEMO ACCOUNTS:');
  console.log('   👨‍💼 Admin: admin@osi.org / admin123');
  console.log('   🏭 Manufacturer: demo@healthsupplements.com / manufacturer123');
  console.log('   👩‍🔬 Reviewer: reviewer@osi.org / reviewer123\n');
  
  console.log('💊 DEMO PRODUCTS:');
  console.log('   ✅ VitaBoost Immune Support (APPROVED with certificate OSI-2024-000001)');
  console.log('   ⏳ Omega-3 Marine Complex (SUBMITTED for review)');
  console.log('   📝 Magnesium Plus B6 (DRAFT)\n');
  
  console.log('🎯 DEMO SCENARIOS:');
  console.log('   1. 🔄 Complete end-to-end workflow demonstration');
  console.log('   2. 📜 Certificate verification and download');
  console.log('   3. 👨‍💼 Admin review and approval process');
  console.log('   4. 🌐 Public catalog browsing and verification\n');
  
  console.log('🚀 QUICK START:');
  console.log('   1. Start the application: npm run dev');
  console.log('   2. Open browser to: http://localhost:3000');
  console.log('   3. Try certificate verification: http://localhost:3000/verify/OSI-2024-000001');
  console.log('   4. Browse public catalog: http://localhost:3000/catalog\n');
  
  console.log('📖 DEMO SCRIPT:');
  console.log('   Full demo script available at: server/database/demo-script.md\n');
  
  console.log('🔧 RESET DEMO:');
  console.log('   To reset demo data: node server/setup-demo.js\n');
  
  console.log('✨ Ready for demonstration!');
}

// Add command line options
const args = process.argv.slice(2);
const isQuiet = args.includes('--quiet') || args.includes('-q');
const isReset = args.includes('--reset') || args.includes('-r');

if (isReset) {
  console.log('🔄 Resetting demo data only...');
  clearDemoData()
    .then(() => createDemoData())
    .then(() => {
      if (!isQuiet) displayDemoInfo();
      process.exit(0);
    })
    .catch(error => {
      console.error('Reset failed:', error);
      process.exit(1);
    });
} else {
  // Run full setup
  setupCompleteDemo()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

module.exports = {
  setupCompleteDemo,
  clearDemoData,
  verifyDemoSetup
};
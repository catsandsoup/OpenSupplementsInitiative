const { query } = require('./database/connection');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');

// Read the comprehensive product data
const comprehensiveProductData = require('../comprehensive-supplement-product.json');

async function insertComprehensiveProduct() {
    try {
        console.log('🚀 Inserting comprehensive product into database...');

        // Generate unique IDs
        const productId = uuidv4();
        const organizationId = uuidv4();
        const userId = uuidv4();

        // First, create a user for this product
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('biowellness123', 10);

        const userResult = await query(`
      INSERT INTO users (id, email, password_hash, role, first_name, last_name, company_name, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `, [
            userId,
            'demo@biowellness.com.au',
            hashedPassword,
            'manufacturer',
            'Dr. Sarah',
            'Chen',
            'BioWellness Therapeutics Pty Ltd',
            true
        ]);

        const actualUserId = userResult.rows[0].id;
        console.log('✅ Created user: demo@biowellness.com.au');

        // Create organization
        await query(`
      INSERT INTO organizations (id, legal_name, trading_name, registration_number, address_line1, city, state, country, postal_code, phone, email, website, is_verified, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `, [
            organizationId,
            'BioWellness Therapeutics Pty Ltd',
            'BioWellness Therapeutics',
            'ACN 987 654 321',
            '456 Innovation Drive',
            'Sydney',
            'NSW',
            'Australia',
            '2000',
            '+61 2 9000 1234',
            'info@biowellness.com.au',
            'https://biowellness.com.au',
            true,
            actualUserId
        ]);

        console.log('✅ Created organization: BioWellness Therapeutics Pty Ltd');

        // Insert the comprehensive supplement product
        await query(`
      INSERT INTO supplements (id, osi_data, organization_id, status, submitted_at, reviewed_at, reviewed_by, created_by)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        osi_data = EXCLUDED.osi_data,
        status = EXCLUDED.status,
        updated_at = CURRENT_TIMESTAMP
    `, [
            productId,
            JSON.stringify(comprehensiveProductData),
            organizationId,
            'approved', // Make it approved so it gets a certificate
            actualUserId, // Self-reviewed for demo purposes
            actualUserId
        ]);

        console.log('✅ Created supplement: ProBiotic Complete Advanced Formula');

        // Generate certificate for the approved product
        const year = new Date().getFullYear();
        const osiNumber = `OSI-${year}-000002`; // Different from existing demo data
        const serialNumber = `${osiNumber}-${Date.now()}`;

        const certificateData = {
            osiNumber,
            supplementId: productId,
            productName: comprehensiveProductData.artgEntry.productName,
            organizationName: 'BioWellness Therapeutics Pty Ltd',
            issuedDate: new Date().toISOString(),
            expiresDate: new Date(Date.now() + (2 * 365 * 24 * 60 * 60 * 1000)).toISOString(),
            status: 'active',
            verificationUrl: `http://localhost:3000/verify/${osiNumber}`
        };

        const crypto = require('crypto');
        const dataToSign = `${osiNumber}|${comprehensiveProductData.artgEntry.productName}|BioWellness Therapeutics Pty Ltd|${certificateData.issuedDate}`;
        const digitalSignature = crypto.createHash('sha256').update(dataToSign).digest('hex');

        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 2);

        await query(`
      INSERT INTO certificates (supplement_id, osi_number, serial_number, certificate_data, digital_signature, expires_at, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (osi_number) DO NOTHING
    `, [
            productId,
            osiNumber,
            serialNumber,
            JSON.stringify(certificateData),
            digitalSignature,
            expiresAt,
            actualUserId
        ]);

        console.log(`✅ Generated certificate: ${osiNumber}`);

        console.log('\n🎉 Comprehensive product insertion completed successfully!');
        console.log('\n📋 New Account Created:');
        console.log('   🏭 BioWellness: demo@biowellness.com.au / biowellness123');

        console.log('\n💊 New Product Created:');
        console.log(`   ✅ ProBiotic Complete Advanced Formula (APPROVED with certificate ${osiNumber})`);
        console.log(`   🆔 Product ID: ${productId}`);
        console.log(`   🏢 Organization: BioWellness Therapeutics Pty Ltd`);

        console.log('\n🎯 Product Features:');
        console.log('   • Multi-strain probiotic with 5 bacterial strains (28 billion CFU total)');
        console.log('   • Complete clinical trial data with NCT and ACTRN numbers');
        console.log('   • Comprehensive drug interaction warnings');
        console.log('   • Detailed contraindications and adverse effects');
        console.log('   • Enhanced storage and shelf-life information');
        console.log('   • Product identifiers including GTIN-13');
        console.log('   • Full regulatory compliance documentation');

        return {
            productId,
            organizationId,
            userId,
            osiNumber
        };

    } catch (error) {
        console.error('❌ Error inserting comprehensive product:', error);
        throw error;
    }
}

// Run insertion if called directly
if (require.main === module) {
    insertComprehensiveProduct()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { insertComprehensiveProduct };
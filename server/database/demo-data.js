const bcrypt = require('bcryptjs');
const { query } = require('./connection');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');

// Enhanced demo supplement products with complete evidence chains
const demoSupplementProducts = [
  {
    id: uuidv4(),
    artgNumber: "AUST L 123456",
    productName: "VitaBoost Immune Support",
    status: "approved", // This one will be fully approved with certificate
    sponsor: "Health Supplements Co. Pty Ltd",
    address: "123 Wellness Street, Melbourne VIC 3000",
    startDate: "2024-01-15",
    packSize: "60 Tablets",
    dosageForm: "Tablet, film coated",
    appearance: "White, oval-shaped, film-coated tablet",
    manufacturingDetails: {
      manufacturer: "Premium Nutraceuticals Pty Ltd",
      manufacturerAddress: "45 Industrial Drive, Sydney NSW 2000",
      gmpCertificate: "GMP-2024-001",
      batchNumber: "VB240115001",
      manufacturingDate: "2024-01-15",
      expiryDate: "2026-01-15"
    },
    supplierDetails: [
      {
        ingredient: "Ascorbic acid",
        supplier: "Vitamin Suppliers Australia",
        supplierAddress: "78 Chemical Street, Brisbane QLD 4000",
        coa: "COA-ASC-240115",
        purityTest: "99.8% pure"
      },
      {
        ingredient: "Zinc sulfate monohydrate", 
        supplier: "Mineral Resources Ltd",
        supplierAddress: "12 Mining Road, Perth WA 6000",
        coa: "COA-ZN-240115",
        purityTest: "98.5% pure"
      }
    ],
    clinicalEvidence: [
      {
        study: "Vitamin C and Immune Function: A Randomized Controlled Trial",
        doi: "10.1234/vitc.2023.001",
        summary: "Double-blind RCT showing 500mg vitamin C daily reduces cold duration by 23%"
      },
      {
        study: "Zinc Supplementation and Immune Response",
        doi: "10.1234/zinc.2023.002", 
        summary: "Meta-analysis of 15 studies confirming zinc's role in immune function"
      }
    ],
    indications: [
      {
        text: "Maintain/support immune system health",
        evidenceNotes: "Supported by clinical studies on vitamin C and zinc"
      },
      {
        text: "Support general health and wellbeing",
        evidenceNotes: "Traditional use of ingredients"
      }
    ],
    warnings: [
      "Always read the label and follow the directions for use",
      "If symptoms persist, talk to your health professional",
      "Contains sulfites"
    ],
    dosage: {
      adults: "Take 1 tablet once daily with food or as directed by your healthcare professional",
      children: "Not recommended for children under 12 years",
      generalNotes: "Best taken with food to enhance absorption"
    },
    allergens: {
      containsAllergens: ["Sulfites"],
      freeOfClaims: ["Gluten-Free", "Dairy-Free", "Vegan"],
      allergenStatement: "Contains sulfites. Free from gluten, dairy, and animal products.",
      crossContaminationRisk: false
    },
    activeIngredients: [
      {
        name: "Ascorbic acid",
        commonName: "Vitamin C",
        quantity: { value: 500, unit: "mg" },
        equivalentTo: null
      },
      {
        name: "Zinc sulfate monohydrate",
        commonName: "Zinc",
        quantity: { value: 22, unit: "mg" },
        equivalentTo: "Zinc 8 mg"
      },
      {
        name: "Echinacea purpurea extract",
        commonName: "Echinacea",
        quantity: { value: 100, unit: "mg" },
        equivalentTo: "Echinacea purpurea (dry root) 500 mg"
      }
    ],
    excipients: [
      { name: "Microcrystalline cellulose" },
      { name: "Magnesium stearate" },
      { name: "Silicon dioxide" },
      { name: "Hypromellose" },
      { name: "Titanium dioxide" }
    ]
  },
  {
    id: uuidv4(),
    artgNumber: "AUST L 234567",
    productName: "Omega-3 Marine Complex",
    status: "submitted", // This one will be under review
    sponsor: "Health Supplements Co. Pty Ltd",
    address: "123 Wellness Street, Melbourne VIC 3000",
    startDate: "2024-02-01",
    packSize: "90 Capsules",
    dosageForm: "Capsule, soft gelatin",
    appearance: "Clear, amber-colored soft gelatin capsule",
    manufacturingDetails: {
      manufacturer: "Marine Extracts Australia",
      manufacturerAddress: "88 Coastal Road, Adelaide SA 5000",
      gmpCertificate: "GMP-2024-002",
      batchNumber: "OM240201001",
      manufacturingDate: "2024-02-01",
      expiryDate: "2026-02-01"
    },
    supplierDetails: [
      {
        ingredient: "Fish oil concentrate",
        supplier: "Pacific Marine Oils",
        supplierAddress: "156 Harbor Drive, Hobart TAS 7000",
        coa: "COA-FO-240201",
        purityTest: "EPA 30%, DHA 20%, Heavy metals <0.1ppm"
      }
    ],
    clinicalEvidence: [
      {
        study: "Omega-3 Fatty Acids and Cardiovascular Health",
        doi: "10.1234/omega3.2023.003",
        summary: "Systematic review showing omega-3 supplementation reduces cardiovascular risk by 15%"
      }
    ],
    indications: [
      {
        text: "Support heart health",
        evidenceNotes: "Clinical studies support cardiovascular benefits of omega-3 fatty acids"
      },
      {
        text: "Support brain function",
        evidenceNotes: "DHA is important for normal brain function"
      }
    ],
    warnings: [
      "Always read the label and follow the directions for use",
      "If symptoms persist, talk to your health professional",
      "Contains fish products"
    ],
    dosage: {
      adults: "Take 1-2 capsules daily with meals or as directed by your healthcare professional",
      children: "Children over 12 years: Take 1 capsule daily",
      generalNotes: "Take with food to reduce fishy aftertaste"
    },
    allergens: {
      containsAllergens: ["Fish"],
      freeOfClaims: ["Gluten-Free", "Dairy-Free"],
      allergenStatement: "Contains fish. Free from gluten and dairy.",
      crossContaminationRisk: null
    },
    activeIngredients: [
      {
        name: "Fish oil concentrate",
        commonName: "Omega-3 Marine Oil",
        quantity: { value: 1000, unit: "mg" },
        equivalentTo: "EPA 300 mg, DHA 200 mg"
      }
    ],
    excipients: [
      { name: "Gelatin" },
      { name: "Glycerol" },
      { name: "Purified water" },
      { name: "Natural vitamin E" }
    ]
  },
  {
    id: uuidv4(),
    artgNumber: "AUST L 345678",
    productName: "Magnesium Plus B6",
    status: "draft", // This one will be in draft state
    sponsor: "Health Supplements Co. Pty Ltd",
    address: "123 Wellness Street, Melbourne VIC 3000",
    startDate: "2024-01-20",
    packSize: "120 Tablets",
    dosageForm: "Tablet, uncoated",
    appearance: "White, round, uncoated tablet",
    manufacturingDetails: {
      manufacturer: "Mineral Health Manufacturing",
      manufacturerAddress: "22 Supplement Lane, Melbourne VIC 3001",
      gmpCertificate: "GMP-2024-003",
      batchNumber: "MG240120001",
      manufacturingDate: "2024-01-20",
      expiryDate: "2026-01-20"
    },
    supplierDetails: [
      {
        ingredient: "Magnesium oxide",
        supplier: "Australian Minerals Co",
        supplierAddress: "99 Mining Avenue, Darwin NT 0800",
        coa: "COA-MG-240120",
        purityTest: "99.2% pure, heavy metals <5ppm"
      }
    ],
    clinicalEvidence: [
      {
        study: "Magnesium Supplementation and Muscle Function",
        doi: "10.1234/magnesium.2023.004",
        summary: "Clinical trial showing magnesium supplementation reduces muscle cramps by 40%"
      }
    ],
    indications: [
      {
        text: "Support muscle function",
        evidenceNotes: "Magnesium is essential for normal muscle function"
      },
      {
        text: "Support nervous system function",
        evidenceNotes: "Magnesium and B6 support normal nervous system function"
      },
      {
        text: "Relieve muscle cramps and mild muscle spasms",
        evidenceNotes: "Traditional use and clinical evidence"
      }
    ],
    warnings: [
      "Always read the label and follow the directions for use",
      "If symptoms persist, talk to your health professional",
      "Contains sulfites"
    ],
    dosage: {
      adults: "Take 1-2 tablets daily or as directed by your healthcare professional",
      children: "Not recommended for children under 12 years",
      generalNotes: "Can be taken with or without food"
    },
    allergens: {
      containsAllergens: ["Sulfites"],
      freeOfClaims: ["Gluten-Free", "Dairy-Free", "Vegan"],
      allergenStatement: "Contains sulfites. Free from gluten, dairy, and animal products.",
      crossContaminationRisk: false
    },
    activeIngredients: [
      {
        name: "Magnesium oxide",
        commonName: "Magnesium",
        quantity: { value: 500, unit: "mg" },
        equivalentTo: "Magnesium 300 mg"
      },
      {
        name: "Pyridoxine hydrochloride",
        commonName: "Vitamin B6",
        quantity: { value: 25, unit: "mg" },
        equivalentTo: "Pyridoxine 20.6 mg"
      }
    ],
    excipients: [
      { name: "Microcrystalline cellulose" },
      { name: "Croscarmellose sodium" },
      { name: "Magnesium stearate" },
      { name: "Silicon dioxide" }
    ]
  }
];

// Demo user accounts with different roles and scenarios
const demoUsers = [
  {
    id: uuidv4(),
    email: 'admin@osi.org',
    password: 'admin123',
    role: 'admin',
    firstName: 'OSI',
    lastName: 'Administrator',
    companyName: 'Open Supplements Initiative'
  },
  {
    id: uuidv4(),
    email: 'demo@healthsupplements.com',
    password: 'manufacturer123',
    role: 'manufacturer',
    firstName: 'John',
    lastName: 'Smith',
    companyName: 'Health Supplements Co.'
  },
  {
    id: uuidv4(),
    email: 'reviewer@osi.org',
    password: 'reviewer123',
    role: 'admin',
    firstName: 'Sarah',
    lastName: 'Johnson',
    companyName: 'Open Supplements Initiative'
  }
];

// Demo organizations
const demoOrganizations = [
  {
    id: uuidv4(),
    legalName: 'Health Supplements Co. Pty Ltd',
    tradingName: 'Health Supplements Co.',
    registrationNumber: 'ACN 123 456 789',
    addressLine1: '123 Wellness Street',
    city: 'Melbourne',
    state: 'VIC',
    country: 'Australia',
    postalCode: '3000',
    phone: '+61 3 9000 0000',
    email: 'info@healthsupplements.com',
    website: 'https://healthsupplements.com',
    isVerified: true
  }
];

const generateOSIData = (productInfo) => {
  return {
    artgEntry: {
      artgNumber: productInfo.artgNumber,
      productName: productInfo.productName,
      type: "Medicine Listed",
      sponsor: productInfo.sponsor,
      postalAddress: productInfo.address,
      artgStartDate: productInfo.startDate,
      productCategory: "Medicine",
      status: "Active",
      approvalArea: "Listed Medicines"
    },
    conditions: [
      "For oral use only",
      "Store below 25°C in a cool, dry place"
    ],
    products: [{
      productName: productInfo.productName,
      productType: "Single Medicine Product",
      effectiveDate: productInfo.startDate
    }],
    permittedIndications: productInfo.indications,
    indicationRequirements: [
      "If symptoms persist, talk to your health professional",
      "Always read the label and follow the directions for use"
    ],
    standardIndications: "No Standard Indications included on Record",
    specificIndications: "No Specific Indications included on Record",
    warnings: productInfo.warnings,
    dosageInformation: productInfo.dosage,
    allergenInformation: productInfo.allergens,
    additionalProductInformation: {
      packSizeInformation: {
        packSize: productInfo.packSize,
        poisonSchedule: null
      },
      manufacturingDetails: productInfo.manufacturingDetails,
      supplierDetails: productInfo.supplierDetails,
      clinicalEvidence: productInfo.clinicalEvidence
    },
    components: [{
      formulation: "Main Formulation",
      dosageForm: productInfo.dosageForm,
      routeOfAdministration: "Oral",
      visualIdentification: productInfo.appearance,
      activeIngredients: productInfo.activeIngredients,
      excipients: productInfo.excipients
    }],
    documentInformation: {
      dataEntrySource: "Product Label and TGA Summary",
      dataEntryDate: new Date().toISOString().split('T')[0],
      version: "0.2-demo",
      notes: "Demo product for OSI platform demonstration"
    }
  };
};

async function createDemoData() {
  try {
    console.log('🚀 Creating comprehensive demo data...');

    // Create demo users
    console.log('👥 Creating demo users...');
    const userIds = {};
    
    for (const user of demoUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      const result = await query(`
        INSERT INTO users (id, email, password_hash, role, first_name, last_name, company_name, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (email) DO UPDATE SET
          password_hash = EXCLUDED.password_hash,
          updated_at = CURRENT_TIMESTAMP
        RETURNING id
      `, [user.id, user.email, hashedPassword, user.role, user.firstName, user.lastName, user.companyName, true]);
      
      userIds[user.email] = result.rows[0].id;
      console.log(`   ✅ Created user: ${user.email} (${user.role})`);
    }

    // Create demo organizations
    console.log('🏢 Creating demo organizations...');
    const orgIds = {};
    
    for (const org of demoOrganizations) {
      const result = await query(`
        INSERT INTO organizations (id, legal_name, trading_name, registration_number, address_line1, city, state, country, postal_code, phone, email, website, is_verified, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (legal_name) DO UPDATE SET
          updated_at = CURRENT_TIMESTAMP
        RETURNING id
      `, [
        org.id, org.legalName, org.tradingName, org.registrationNumber,
        org.addressLine1, org.city, org.state, org.country, org.postalCode,
        org.phone, org.email, org.website, org.isVerified,
        userIds['demo@healthsupplements.com']
      ]);
      
      orgIds[org.legalName] = result.rows[0].id;
      console.log(`   ✅ Created organization: ${org.legalName}`);
    }

    // Create demo supplements with different statuses
    console.log('💊 Creating demo supplement products...');
    const supplementIds = {};
    
    for (const product of demoSupplementProducts) {
      const osiData = generateOSIData(product);
      
      const submittedAt = product.status !== 'draft' ? 'CURRENT_TIMESTAMP' : null;
      const reviewedAt = product.status === 'approved' ? 'CURRENT_TIMESTAMP' : null;
      const reviewedBy = product.status === 'approved' ? userIds['admin@osi.org'] : null;
      
      const result = await query(`
        INSERT INTO supplements (id, osi_data, organization_id, status, submitted_at, reviewed_at, reviewed_by, created_by)
        VALUES ($1, $2, $3, $4, ${submittedAt}, ${reviewedAt}, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          osi_data = EXCLUDED.osi_data,
          status = EXCLUDED.status,
          updated_at = CURRENT_TIMESTAMP
        RETURNING id
      `, [
        product.id,
        JSON.stringify(osiData),
        orgIds['Health Supplements Co. Pty Ltd'],
        product.status,
        reviewedBy,
        userIds['demo@healthsupplements.com']
      ]);
      
      supplementIds[product.productName] = result.rows[0].id;
      console.log(`   ✅ Created supplement: ${product.productName} (${product.status})`);
    }

    // Generate certificate for approved product
    console.log('📜 Generating demo certificate...');
    const approvedProduct = demoSupplementProducts.find(p => p.status === 'approved');
    if (approvedProduct) {
      const year = new Date().getFullYear();
      const osiNumber = `OSI-${year}-000001`;
      const serialNumber = `${osiNumber}-${Date.now()}`;
      
      const certificateData = {
        osiNumber,
        supplementId: approvedProduct.id,
        productName: approvedProduct.productName,
        organizationName: 'Health Supplements Co. Pty Ltd',
        issuedDate: new Date().toISOString(),
        expiresDate: new Date(Date.now() + (2 * 365 * 24 * 60 * 60 * 1000)).toISOString(),
        status: 'active',
        verificationUrl: `http://localhost:3000/verify/${osiNumber}`
      };
      
      const crypto = require('crypto');
      const dataToSign = `${osiNumber}|${approvedProduct.productName}|Health Supplements Co. Pty Ltd|${certificateData.issuedDate}`;
      const digitalSignature = crypto.createHash('sha256').update(dataToSign).digest('hex');
      
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 2);
      
      await query(`
        INSERT INTO certificates (supplement_id, osi_number, serial_number, certificate_data, digital_signature, expires_at, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (osi_number) DO UPDATE SET
          certificate_data = EXCLUDED.certificate_data,
          updated_at = CURRENT_TIMESTAMP
      `, [
        supplementIds[approvedProduct.productName],
        osiNumber,
        serialNumber,
        JSON.stringify(certificateData),
        digitalSignature,
        expiresAt,
        userIds['admin@osi.org']
      ]);
      
      console.log(`   ✅ Generated certificate: ${osiNumber}`);
    }

    console.log('\n🎉 Demo data creation completed successfully!');
    console.log('\n📋 Demo Accounts Created:');
    console.log('   👨‍💼 Admin: admin@osi.org / admin123');
    console.log('   🏭 Manufacturer: demo@healthsupplements.com / manufacturer123');
    console.log('   👩‍🔬 Reviewer: reviewer@osi.org / reviewer123');
    
    console.log('\n💊 Demo Products Created:');
    console.log('   ✅ VitaBoost Immune Support (APPROVED with certificate OSI-2024-000001)');
    console.log('   ⏳ Omega-3 Marine Complex (SUBMITTED for review)');
    console.log('   📝 Magnesium Plus B6 (DRAFT)');
    
    console.log('\n🎯 Demo Scenarios Available:');
    console.log('   1. Complete end-to-end workflow demonstration');
    console.log('   2. Certificate verification and download');
    console.log('   3. Admin review and approval process');
    console.log('   4. Public catalog browsing and verification');

  } catch (error) {
    console.error('❌ Error creating demo data:', error);
    throw error;
  }
}

// Run demo data creation if called directly
if (require.main === module) {
  createDemoData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { 
  createDemoData,
  demoSupplementProducts,
  demoUsers,
  demoOrganizations
};
const fs = require('fs').promises;
const path = require('path');
const PDFDocument = require('pdfkit');

// Mock document templates for demo purposes
const mockDocumentTemplates = {
  labTest: {
    title: 'Certificate of Analysis - Third Party Laboratory Testing',
    laboratory: 'Australian Analytical Laboratories Pty Ltd',
    address: '456 Science Park Drive, Sydney NSW 2000',
    phone: '+61 2 9000 1234',
    email: 'reports@ausanalytical.com.au',
    accreditation: 'NATA Accredited Laboratory #12345'
  },
  gmpCertificate: {
    title: 'Good Manufacturing Practice (GMP) Certificate',
    certifyingBody: 'TGA - Therapeutic Goods Administration',
    address: 'PO Box 100, Woden ACT 2606',
    phone: '+61 2 6232 8444',
    website: 'www.tga.gov.au'
  },
  factoryCertificate: {
    title: 'Manufacturing Facility Inspection Certificate',
    inspector: 'Quality Assurance International',
    address: '789 Industrial Avenue, Melbourne VIC 3000',
    phone: '+61 3 9000 5678',
    accreditation: 'ISO 9001:2015 Certified'
  }
};

async function generateMockLabTest(productName, ingredients, outputPath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = require('fs').createWriteStream(outputPath);
      doc.pipe(stream);

      // Header
      doc.fontSize(20).fillColor('#1976d2').text(mockDocumentTemplates.labTest.title, 50, 50);
      doc.fontSize(12).fillColor('#000')
         .text(mockDocumentTemplates.labTest.laboratory, 50, 80)
         .text(mockDocumentTemplates.labTest.address, 50, 95)
         .text(`Phone: ${mockDocumentTemplates.labTest.phone}`, 50, 110)
         .text(`Email: ${mockDocumentTemplates.labTest.email}`, 50, 125)
         .text(mockDocumentTemplates.labTest.accreditation, 50, 140);

      // Product Information
      doc.fontSize(16).fillColor('#1976d2').text('Product Information', 50, 180);
      doc.fontSize(12).fillColor('#000')
         .text(`Product Name: ${productName}`, 50, 205)
         .text(`Test Date: ${new Date().toLocaleDateString()}`, 50, 220)
         .text(`Report Number: COA-${Date.now()}`, 50, 235)
         .text(`Batch Number: DEMO-${new Date().getFullYear()}-001`, 50, 250);

      // Test Results
      doc.fontSize(16).fillColor('#1976d2').text('Analytical Results', 50, 290);
      
      let yPos = 315;
      ingredients.forEach((ingredient, index) => {
        doc.fontSize(14).fillColor('#000').text(`${index + 1}. ${ingredient.commonName}`, 50, yPos);
        doc.fontSize(11).fillColor('#666')
           .text(`   Specification: ${ingredient.quantity.value} ${ingredient.quantity.unit}`, 70, yPos + 15)
           .text(`   Result: ${ingredient.quantity.value * 0.98} ${ingredient.quantity.unit}`, 70, yPos + 30)
           .text(`   Method: HPLC-UV`, 70, yPos + 45)
           .text(`   Status: PASS`, 70, yPos + 60);
        yPos += 85;
      });

      // Microbiological Tests
      const microYPos = yPos + 20;
      doc.fontSize(16).fillColor('#1976d2').text('Microbiological Testing', 50, microYPos);
      doc.fontSize(12).fillColor('#000')
         .text('Total Plate Count: <1000 CFU/g (PASS)', 70, microYPos + 25)
         .text('Yeast & Mould: <100 CFU/g (PASS)', 70, microYPos + 40)
         .text('E. coli: Not Detected (PASS)', 70, microYPos + 55)
         .text('Salmonella: Not Detected (PASS)', 70, microYPos + 70);

      // Heavy Metals
      const metalYPos = microYPos + 110;
      doc.fontSize(16).fillColor('#1976d2').text('Heavy Metals Analysis', 50, metalYPos);
      doc.fontSize(12).fillColor('#000')
         .text('Lead (Pb): <0.5 ppm (PASS)', 70, metalYPos + 25)
         .text('Mercury (Hg): <0.1 ppm (PASS)', 70, metalYPos + 40)
         .text('Cadmium (Cd): <0.3 ppm (PASS)', 70, metalYPos + 55)
         .text('Arsenic (As): <0.5 ppm (PASS)', 70, metalYPos + 70);

      // Conclusion
      const conclusionYPos = metalYPos + 110;
      doc.fontSize(16).fillColor('#1976d2').text('Conclusion', 50, conclusionYPos);
      doc.fontSize(12).fillColor('#000')
         .text('All tested parameters meet the specified requirements.', 50, conclusionYPos + 25)
         .text('This product is suitable for release.', 50, conclusionYPos + 40);

      // Signature
      doc.fontSize(12).fillColor('#000')
         .text('Authorized by: Dr. Sarah Mitchell, Laboratory Director', 50, 720)
         .text(`Date: ${new Date().toLocaleDateString()}`, 50, 735)
         .text('This report may not be reproduced except in full without written approval.', 50, 760);

      doc.end();
      
      stream.on('finish', () => resolve(outputPath));
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
}

async function generateMockGMPCertificate(manufacturerName, facilityAddress, outputPath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = require('fs').createWriteStream(outputPath);
      doc.pipe(stream);

      // Header
      doc.fontSize(24).fillColor('#1976d2').text('CERTIFICATE', 50, 50, { align: 'center' });
      doc.fontSize(18).fillColor('#000').text(mockDocumentTemplates.gmpCertificate.title, 50, 90, { align: 'center' });
      
      // TGA Logo placeholder
      doc.fontSize(12).fillColor('#666').text('[TGA LOGO]', 50, 130, { align: 'center' });
      
      // Certificate body
      doc.fontSize(14).fillColor('#000')
         .text('This is to certify that:', 50, 180)
         .text(manufacturerName, 50, 210, { underline: true })
         .text(facilityAddress, 50, 230)
         .text('has been inspected and found to comply with the requirements of:', 50, 270)
         .text('Good Manufacturing Practice (GMP) Standards', 50, 300, { underline: true })
         .text('as specified in the Therapeutic Goods Order No. 101', 50, 320);

      // Certificate details
      doc.fontSize(12).fillColor('#000')
         .text(`Certificate Number: GMP-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`, 50, 370)
         .text(`Issue Date: ${new Date().toLocaleDateString()}`, 50, 390)
         .text(`Valid Until: ${new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)).toLocaleDateString()}`, 50, 410)
         .text('Scope: Manufacture of Listed Medicines (Tablets, Capsules)', 50, 430);

      // Conditions
      doc.fontSize(14).fillColor('#1976d2').text('Conditions:', 50, 470);
      doc.fontSize(12).fillColor('#000')
         .text('1. This certificate is valid only for the activities and premises specified above.', 70, 495)
         .text('2. The manufacturer must notify TGA of any significant changes to operations.', 70, 515)
         .text('3. Regular surveillance inspections may be conducted.', 70, 535)
         .text('4. This certificate may be suspended or cancelled for non-compliance.', 70, 555);

      // Authority signature
      doc.fontSize(12).fillColor('#000')
         .text('Therapeutic Goods Administration', 50, 620)
         .text('Australian Government Department of Health', 50, 635)
         .text('Authorized Officer: John Anderson', 50, 665)
         .text(`Date: ${new Date().toLocaleDateString()}`, 50, 680)
         .text('[Official Seal]', 50, 710);

      // Footer
      doc.fontSize(10).fillColor('#666')
         .text('This certificate is issued under the Therapeutic Goods Act 1989', 50, 750, { align: 'center' })
         .text('For verification, visit: www.tga.gov.au/verify', 50, 765, { align: 'center' });

      doc.end();
      
      stream.on('finish', () => resolve(outputPath));
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
}

async function generateMockFactoryCertificate(facilityName, inspectionType, outputPath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = require('fs').createWriteStream(outputPath);
      doc.pipe(stream);

      // Header
      doc.fontSize(20).fillColor('#1976d2').text(mockDocumentTemplates.factoryCertificate.title, 50, 50);
      doc.fontSize(14).fillColor('#000')
         .text(mockDocumentTemplates.factoryCertificate.inspector, 50, 80)
         .text(mockDocumentTemplates.factoryCertificate.address, 50, 95)
         .text(`Phone: ${mockDocumentTemplates.factoryCertificate.phone}`, 50, 110)
         .text(mockDocumentTemplates.factoryCertificate.accreditation, 50, 125);

      // Inspection Details
      doc.fontSize(16).fillColor('#1976d2').text('Inspection Details', 50, 165);
      doc.fontSize(12).fillColor('#000')
         .text(`Facility Name: ${facilityName}`, 50, 190)
         .text(`Inspection Type: ${inspectionType}`, 50, 205)
         .text(`Inspection Date: ${new Date().toLocaleDateString()}`, 50, 220)
         .text(`Inspector: Jane Wilson, Senior Quality Auditor`, 50, 235)
         .text(`Report Number: INSP-${Date.now()}`, 50, 250);

      // Inspection Areas
      doc.fontSize(16).fillColor('#1976d2').text('Areas Inspected', 50, 290);
      const areas = [
        'Raw Material Storage and Handling',
        'Production Equipment and Processes',
        'Quality Control Laboratory',
        'Packaging and Labeling Operations',
        'Documentation and Record Keeping',
        'Personnel Training and Hygiene',
        'Facility Maintenance and Cleaning'
      ];

      let yPos = 315;
      areas.forEach((area, index) => {
        doc.fontSize(12).fillColor('#000')
           .text(`${index + 1}. ${area}`, 70, yPos)
           .text('Status: COMPLIANT ✓', 400, yPos);
        yPos += 20;
      });

      // Findings
      doc.fontSize(16).fillColor('#1976d2').text('Key Findings', 50, yPos + 20);
      doc.fontSize(12).fillColor('#000')
         .text('• All manufacturing processes follow documented procedures', 70, yPos + 45)
         .text('• Quality control systems are adequate and functioning', 70, yPos + 60)
         .text('• Personnel are properly trained and qualified', 70, yPos + 75)
         .text('• Facility maintenance is current and documented', 70, yPos + 90)
         .text('• No critical non-conformances identified', 70, yPos + 105);

      // Recommendations
      doc.fontSize(16).fillColor('#1976d2').text('Recommendations', 50, yPos + 140);
      doc.fontSize(12).fillColor('#000')
         .text('• Continue current quality management practices', 70, yPos + 165)
         .text('• Schedule next routine inspection in 12 months', 70, yPos + 180)
         .text('• Maintain current documentation standards', 70, yPos + 195);

      // Conclusion
      doc.fontSize(16).fillColor('#1976d2').text('Conclusion', 50, yPos + 230);
      doc.fontSize(12).fillColor('#000')
         .text('The facility demonstrates compliance with GMP requirements and', 50, yPos + 255)
         .text('maintains appropriate quality systems for supplement manufacturing.', 50, yPos + 270);

      // Signature
      doc.fontSize(12).fillColor('#000')
         .text('Inspector Signature: Jane Wilson', 50, 720)
         .text(`Date: ${new Date().toLocaleDateString()}`, 50, 735)
         .text('Quality Assurance International', 50, 750);

      doc.end();
      
      stream.on('finish', () => resolve(outputPath));
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
}

async function createMockDocuments() {
  try {
    console.log('📄 Creating mock document templates...');
    
    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, '../uploads/demo');
    await fs.mkdir(uploadsDir, { recursive: true });

    // Generate mock documents for VitaBoost Immune Support
    const vitaBoostIngredients = [
      { commonName: 'Vitamin C', quantity: { value: 500, unit: 'mg' } },
      { commonName: 'Zinc', quantity: { value: 8, unit: 'mg' } },
      { commonName: 'Echinacea', quantity: { value: 100, unit: 'mg' } }
    ];

    const labTestPath = path.join(uploadsDir, 'vitaboost-lab-test.pdf');
    await generateMockLabTest('VitaBoost Immune Support', vitaBoostIngredients, labTestPath);
    console.log('   ✅ Generated lab test certificate');

    const gmpCertPath = path.join(uploadsDir, 'premium-nutraceuticals-gmp.pdf');
    await generateMockGMPCertificate(
      'Premium Nutraceuticals Pty Ltd',
      '45 Industrial Drive, Sydney NSW 2000',
      gmpCertPath
    );
    console.log('   ✅ Generated GMP certificate');

    const factoryCertPath = path.join(uploadsDir, 'factory-inspection-cert.pdf');
    await generateMockFactoryCertificate(
      'Premium Nutraceuticals Manufacturing Facility',
      'Annual GMP Compliance Inspection',
      factoryCertPath
    );
    console.log('   ✅ Generated factory inspection certificate');

    console.log('📄 Mock documents created successfully!');
    
    return {
      labTest: labTestPath,
      gmpCertificate: gmpCertPath,
      factoryCertificate: factoryCertPath
    };

  } catch (error) {
    console.error('❌ Error creating mock documents:', error);
    throw error;
  }
}

module.exports = {
  createMockDocuments,
  generateMockLabTest,
  generateMockGMPCertificate,
  generateMockFactoryCertificate,
  mockDocumentTemplates
};
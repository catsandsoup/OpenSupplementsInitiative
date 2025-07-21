const { query } = require('./database/connection');

async function fixWarnings() {
  try {
    console.log('🔧 Fixing warnings structure...');
    
    // Simple string warnings that React can render
    const warnings = [
      'Always read the label and follow the directions for use',
      'If symptoms persist, talk to your health professional', 
      'Contains milk products',
      'Not recommended for severely immunocompromised individuals',
      'Discontinue use if adverse reactions occur',
      'Store in refrigerator after opening to maintain potency'
    ];
    
    // Update the product with the certificate
    const result = await query(`
      UPDATE supplements 
      SET osi_data = jsonb_set(osi_data, '{warnings}', $1)
      WHERE id = $2
    `, [JSON.stringify(warnings), 'a0983019-9333-4cac-bf66-86052033ef38']);
    
    console.log('✅ Fixed warnings structure for ProBiotic product');
    console.log('✅ Warnings are now simple strings that React can render');
    
  } catch (error) {
    console.error('❌ Error fixing warnings:', error);
  }
  process.exit(0);
}

fixWarnings();
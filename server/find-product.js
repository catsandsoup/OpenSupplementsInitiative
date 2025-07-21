const { query } = require('./database/connection');

async function findProduct() {
  try {
    const result = await query(`
      SELECT id, osi_data->'artgEntry'->>'productName' as name 
      FROM supplements 
      WHERE osi_data->'artgEntry'->>'productName' LIKE '%ProBiotic%' 
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    
    if (result.rows.length > 0) {
      console.log('Current Product ID:', result.rows[0].id);
      console.log('Product Name:', result.rows[0].name);
    } else {
      console.log('No ProBiotic product found');
    }
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

findProduct();
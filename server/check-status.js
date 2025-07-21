const { query } = require('./database/connection');

async function checkStatus() {
  try {
    const result = await query(`
      SELECT s.status as supplement_status, c.status as cert_status, c.osi_number
      FROM supplements s 
      LEFT JOIN certificates c ON s.id = c.supplement_id 
      WHERE s.id = 'f0a3b92f-9ec5-4cca-a132-5e1244e492c9'
    `);
    
    if (result.rows.length > 0) {
      console.log('Status:', result.rows[0]);
    } else {
      console.log('Product not found');
    }
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

checkStatus();
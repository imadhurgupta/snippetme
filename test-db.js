require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
  console.log('Testing connection to the database...');
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Connection successful! Current DB Time:', res.rows[0].now);
    
    console.log('Checking tables...');
    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    if (tables.rows.length === 0) {
      console.log('⚠️ No tables found in the public schema.');
    } else {
      console.log('✅ Found tables:');
      tables.rows.forEach(t => console.log('   - ' + t.table_name));
    }
    
  } catch (err) {
    console.error('❌ Connection failed!');
    console.error(err.message);
  } finally {
    await pool.end();
  }
}

testConnection();

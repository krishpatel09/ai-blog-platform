require('dotenv').config();
const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;

async function inspectColumns() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is missing');
    return;
  }

  const pool = new Pool({ connectionString });

  try {
    await pool.connect();
    const result = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'User'
        `);
    console.log('Columns in User table:', result.rows);
    await pool.end();
  } catch (err) {
    console.error('Error:', err);
  }
}

inspectColumns();

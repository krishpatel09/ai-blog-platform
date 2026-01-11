
require('dotenv').config();
const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;

async function testPool() {
    const connectionString = process.env.DATABASE_URL;
    console.log('Testing Pool with connectionString:', connectionString ? 'PRESENT' : 'MISSING');
    
    if (!connectionString) {
        console.error('DATABASE_URL is missing');
        return;
    }

    const pool = new Pool({ connectionString });
    
    try {
        console.log('Connecting...');
        const client = await pool.connect();
        console.log('Connected! Querying...');
        const result = await client.query('SELECT 1');
        console.log('Query success:', result.rows);
        client.release();
        console.log('Client released');
        await pool.end();
        console.log('Pool ended');
    } catch (err) {
        console.error('Pool Error:', err);
    }
}

testPool();

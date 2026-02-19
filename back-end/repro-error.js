const { PrismaClient } = require('@prisma/client');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
require('dotenv').config();

neonConfig.webSocketConstructor = ws;

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is missing');
    return;
  }
  console.log(
    'Using connection string:',
    connectionString.replace(/:[^:@]+@/, ':****@'),
  );

  const pool = new Pool({ connectionString });

  // Test pool directly first
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('Pool connection verified');
  } catch (e) {
    console.error('Pool connection failed:', e);
    return;
  }

  const adapter = new PrismaNeon(pool);
  const prisma = new PrismaClient({ adapter, log: ['query'] });

  try {
    console.log('Attempting to find user with include security...');
    // This mimics the failing call in auth.service.ts
    // We use a dummy email or just findAll to trigger the column access
    const user = await prisma.user.findFirst({
      include: { security: true },
    });
    console.log('Query successful:', user);
  } catch (e) {
    console.error('Query failed:', e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();

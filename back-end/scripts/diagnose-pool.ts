import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import { WebSocket } from 'ws';
import * as dotenv from 'dotenv';
dotenv.config();

neonConfig.webSocketConstructor = WebSocket;

async function run() {
    const connectionString = process.env.DATABASE_URL;
    console.log('1. Connection String defined:', !!connectionString);
    if (connectionString) {
        console.log('   Length:', connectionString.length);
        console.log('   Starts with:', connectionString.substring(0, 15) + '...');
    } else {
        console.error('❌ DATABASE_URL missing');
        process.exit(1);
    }

    // Test 1: Raw Pool
    console.log('\n2. Testing Raw Pool...');
    const pool = new Pool({ connectionString });

    // Inspect pool config if possible (private, but we can try printing keys)
    console.log('   Pool Initialized.');

    try {
        const client = await pool.connect();
        console.log('   ✅ Raw Pool connected!');
        const res = await client.query('SELECT version()');
        console.log('   ✅ Query result:', res.rows[0]);
        client.release();
    } catch (e) {
        console.error('   ❌ Raw Pool failed:', e);
        // If raw pool fails, we stop
    }

    // Test 2: Prisma Adapter
    console.log('\n3. Testing Prisma Adapter...');
    // Create new pool for adapter just to be clean
    const poolForAdapter = new Pool({ connectionString });
    const adapter = new PrismaNeon(poolForAdapter as any);

    const prisma = new PrismaClient({ adapter });

    try {
        console.log('   Connecting Prisma...');
        await prisma.$connect();
        console.log('   ✅ Prisma connected!');

        console.log('   Running Prisma Query...');
        const count = await prisma.user.count();
        console.log('   ✅ Prisma Query result:', count);
    } catch (e) {
        console.error('   ❌ Prisma Adapter failed:', e);
        console.error(JSON.stringify(e, null, 2));
    } finally {
        await prisma.$disconnect();
        await poolForAdapter.end();
    }
}

run();

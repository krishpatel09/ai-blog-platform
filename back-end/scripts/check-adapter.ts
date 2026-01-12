import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import { WebSocket } from 'ws';
import * as dotenv from 'dotenv';
dotenv.config();

// Match PrismaService exactly
neonConfig.webSocketConstructor = WebSocket;

async function main() {
    const connectionString = process.env.DATABASE_URL;
    console.log('Connecting with length:', connectionString?.length);

    if (!connectionString) {
        console.error('Missing DATABASE_URL');
        return;
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool as any);
    const prisma = new PrismaClient({ adapter, log: ['query', 'info', 'warn', 'error'] });

    console.log('Connecting...');
    try {
        await prisma.$connect();
        console.log('✅ Connected via adapter!');

        // Try a query
        const count = await prisma.user.count();
        console.log('User count:', count);

    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();

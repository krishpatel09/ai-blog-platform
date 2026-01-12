import { PrismaService } from './src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import databaseConfig from './src/config/database.config';

async function testConnection() {
    console.log('🧪 Testing Prisma Neon Adapter Connection...\n');

    // Create ConfigService with database config
    const configService = new ConfigService({
        database: databaseConfig(),
    });

    // Initialize PrismaService
    const prisma = new PrismaService(configService);

    try {
        // Test connection
        await prisma.$connect();
        console.log('✅ Connection successful!\n');

        // Test actual query
        console.log('🔍 Testing user count query...');
        const userCount = await prisma.user.count();
        console.log(`✅ Query successful! User count: ${userCount}\n`);

        // Test transaction
        console.log('🔍 Testing transaction...');
        const result = await prisma.$transaction(async (tx) => {
            const count = await tx.user.count();
            return count;
        });
        console.log(`✅ Transaction successful! Count: ${result}\n`);

        console.log('🎉 All tests passed! The Neon adapter is working correctly.');
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();

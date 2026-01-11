import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { WebSocket } from 'ws';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    // 1. Force fetch from process.env, with fallback loader
    if (!process.env.DATABASE_URL) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('dotenv').config();
    }
    const connectionString = process.env.DATABASE_URL;

    // IMPORTANT DEBUG LOG
    console.log('------------------------------------------------');
    console.log('DEBUG: Connection string length:', connectionString ? connectionString.length : 'NULL/UNDEFINED');
    console.log('DEBUG: Connection string starts with:', connectionString ? connectionString.substring(0, 15) + '...' : 'N/A');
    console.log('DEBUG: WebSocket constructor type:', typeof WebSocket);
    console.log('------------------------------------------------');

    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined in the environment. Please check your .env file.');
    }

    // 2. Configure Neon to use WebSockets
    neonConfig.webSocketConstructor = WebSocket;

    // 3. Initialize Pool with explicit connectionString property
    const pool = new Pool({ connectionString });

    // 4. Initialize Adapter
    const adapter = new PrismaNeon(pool as any);

    // 5. Pass to PrismaClient
    super({ adapter });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Prisma connected to Neon successfully');
    } catch (error) {
      this.logger.error('❌ Prisma connection failed');
      console.error(error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
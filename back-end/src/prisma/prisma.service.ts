import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { WebSocket } from 'ws';

neonConfig.webSocketConstructor = WebSocket;
if (typeof fetch !== 'undefined') {
  neonConfig.fetchFunction = fetch;
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private config: ConfigService) {
    const connectionString = config.get<string>('DATABASE_URL');

    if (!connectionString) {
      throw new Error('❌ DATABASE_URL missing');
    }

    const adapter = new PrismaNeon({ connectionString });

    super({ adapter });

  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Connected to Neon DB successfully');
    } catch (error) {
      this.logger.error('❌ DB Connection Error');
      console.error(error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('👋 Database connection closed');
  }
}
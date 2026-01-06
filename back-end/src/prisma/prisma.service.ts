import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaNeonHttp } from '@prisma/adapter-neon';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly config: ConfigService) {
    const databaseUrl = config.get<string>('DATABASE_URL');

    if (!databaseUrl || databaseUrl.trim() === '') {
      throw new Error('DATABASE_URL is required');
    }

    // Create Neon HTTP adapter for Prisma 7.x
    // PrismaNeonHttp uses HTTP connections (good for serverless)
    const neonAdapter = new PrismaNeonHttp(databaseUrl, {
      arrayMode: false,
      fullResults: false,
    });

    super({
      adapter: neonAdapter,
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('Prisma connected to Neon PostgreSQL');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('Prisma disconnected from Neon PostgreSQL');
  }
}

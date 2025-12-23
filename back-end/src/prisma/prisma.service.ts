import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { createPool, Pool, PoolConfig } from 'mariadb';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private mysqlConnectionPool: Pool;

  constructor(config: ConfigService) {
    const databaseUrl = config.get<string>('DATABASE_URL');

    if (!databaseUrl || databaseUrl.trim() === '') {
      throw new Error('DATABASE_URL is required');
    }

    const url = new URL(databaseUrl);

    const mysqlPoolConfig: PoolConfig = {
      host: url.hostname,
      port: url.port ? parseInt(url.port, 10) : 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      connectionLimit: 10,
      minDelayValidation: 2000,
    };

    const mysqlPool = createPool(mysqlPoolConfig);

    const mysqlAdapter = new PrismaMariaDb(mysqlPoolConfig);

    super({ adapter: mysqlAdapter });

    this.mysqlConnectionPool = mysqlPool;

    process.env.DATABASE_URL = databaseUrl;
  }

  async onModuleInit() {
    await this.$connect();
    console.log('Prisma connected to MySQL...');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.mysqlConnectionPool.end();
    console.log('Prisma disconnected from MySQL...');
  }
}

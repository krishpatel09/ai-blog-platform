import {
  Inject,
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  onModuleInit() {
    this.logger.log('RedisService initialized with IORedis');
  }

  onModuleDestroy() {
    this.redisClient.disconnect();
  }

  async get<T>(key: string): Promise<T | undefined> {
    const value = await this.redisClient.get(key);
    if (!value) return undefined;
    try {
      return JSON.parse(value) as T;
    } catch (e) {
      return value as unknown as T;
    }
  }

  private readonly DEFAULT_TTL = process.env.REDIS_TTL
    ? parseInt(process.env.REDIS_TTL, 10)
    : 5 * 60; // Default to 5 minutes if not set

  async set(key: string, value: any, ttl?: number) {
    const stringValue =
      typeof value === 'string' ? value : JSON.stringify(value);

    const expirationSeconds = ttl ? Math.ceil(ttl / 1000) : this.DEFAULT_TTL;

    await this.redisClient.set(key, stringValue, 'EX', expirationSeconds);
  }

  async del(key: string) {
    await this.redisClient.del(key);
  }

  async reset() {
    await this.redisClient.flushall();
  }
}

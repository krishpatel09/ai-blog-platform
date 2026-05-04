import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async () => {
        if (!process.env.REDIS_URL) {
          throw new Error('REDIS_URL is not defined in .env');
        }

        const redis = new Redis(process.env.REDIS_URL, {
          maxRetriesPerRequest: 3,
          connectTimeout: 10000,
        });

        redis.on('connect', () => {
          console.log(' Redis Connected Successfully');
        });

        redis.on('error', (err) => {
          console.error('Redis Error:', err);
        });

        try {
          const res = await redis.ping();
          console.log('PING Response:', res);
        } catch (err) {
          console.error('Ping Failed:', err);
        }

        return redis;
      },
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule {}

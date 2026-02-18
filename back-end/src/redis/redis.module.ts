import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const redis = new Redis({
          host: process.env.REDIS_HOST,
          port: parseInt(process.env.REDIS_PORT || '1000'),
          password: process.env.REDIS_PASSWORD,
          tls: {
            servername: process.env.REDIS_HOST,
          },
          family: 4,
          connectTimeout: 10000,
          maxRetriesPerRequest: 3,
        });
        redis.on('connect', () => {
          console.log('✅ Redis Connected Successfully');
        });
        redis.on('error', (err) => {
          console.error('❌ Redis Error:', err);
        });
        redis
          .ping()
          .then((res) => console.log('PING Response:', res))
          .catch((err) => console.error('Ping Failed:', err));

        return redis;
      },
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheService } from './cache.service';

import {
  BlacklistedToken,
  BlacklistedTokenSchema,
} from './schemas/blacklisted-token.schema';

import { RateLimit, RateLimitSchema } from './schemas/rate-limit.schema';

import {
  SessionCache,
  SessionCacheSchema,
} from './schemas/session-cache.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BlacklistedToken.name, schema: BlacklistedTokenSchema },
      { name: RateLimit.name, schema: RateLimitSchema },
      { name: SessionCache.name, schema: SessionCacheSchema },
    ]),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}

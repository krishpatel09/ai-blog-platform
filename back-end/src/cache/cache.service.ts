import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BlacklistedToken } from './schemas/blacklisted-token.schema';
import { RateLimit } from './schemas/rate-limit.schema';
import { SessionCache } from './schemas/session-cache.schema';

@Injectable()
export class CacheService {
  constructor(
    @InjectModel(BlacklistedToken.name)
    private blacklistedTokenModel: Model<BlacklistedToken>,

    @InjectModel(RateLimit.name)
    private rateLimitModel: Model<RateLimit>,

    @InjectModel(SessionCache.name)
    private sessionCacheModel: Model<SessionCache>,
  ) {}

  // Blacklist token
  async blacklistToken(
    token: string,
    userId: number,
    expiresInSeconds: number,
    reason?: string,
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    await this.blacklistedTokenModel.create({
      token,
      userId,
      expiresAt,
      reason,
    });
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const exists = await this.blacklistedTokenModel.exists({
      token,
      expiresAt: { $gt: new Date() },
    });

    return !!exists;
  }

  async removeBlacklistedToken(token: string): Promise<void> {
    await this.blacklistedTokenModel.deleteOne({ token });
  }

  async blacklistAllUserTokens(
    userId: number,
    expiresInSeconds: number,
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    await this.blacklistedTokenModel.create({
      token: `user:${userId}:*`,
      userId,
      expiresAt,
      reason: 'All sessions revoked',
    });
  }

  // Rate limit

  async checkRateLimit(
    key: string,
    maxAttempts: number,
    windowSeconds: number,
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: Date;
  }> {
    const now = new Date();

    let record = await this.rateLimitModel.findOne({
      key,
      expiresAt: { $gt: now },
    });

    if (!record) {
      const expiresAt = new Date(now.getTime() + windowSeconds * 1000);

      record = await this.rateLimitModel.create({
        key,
        attempts: 1,
        expiresAt,
      });

      return {
        allowed: true,
        remaining: maxAttempts - 1,
        resetAt: expiresAt,
      };
    }

    if (record.attempts >= maxAttempts) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: record.expiresAt,
      };
    }

    record.attempts += 1;
    await record.save();

    return {
      allowed: true,
      remaining: maxAttempts - record.attempts,
      resetAt: record.expiresAt,
    };
  }

  async resetRateLimit(key: string): Promise<void> {
    await this.rateLimitModel.deleteOne({ key });
  }

  // Session cache

  async setCache(
    userId: number,
    data: Record<string, any>,
    ttlSeconds = 3600,
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    await this.sessionCacheModel.findOneAndUpdate(
      { userId },
      { userId, data, expiresAt },
      { upsert: true },
    );
  }

  async getCache(userId: number): Promise<Record<string, any> | null> {
    const cache = await this.sessionCacheModel.findOne({
      userId,
      expiresAt: { $gt: new Date() },
    });

    return cache ? cache.data : null;
  }

  async deleteCache(userId: number): Promise<void> {
    await this.sessionCacheModel.deleteOne({ userId });
  }

  async clearExpiredCache(): Promise<void> {
    const now = new Date();
    await this.blacklistedTokenModel.deleteMany({ expiresAt: { $lt: now } });
    await this.rateLimitModel.deleteMany({ expiresAt: { $lt: now } });
    await this.sessionCacheModel.deleteMany({ expiresAt: { $lt: now } });
  }
}

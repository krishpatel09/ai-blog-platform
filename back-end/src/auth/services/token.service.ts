import {
  Injectable,
  UnauthorizedException,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

interface BlacklistedToken {
  token: string;
  userId: number;
  expiresAt: Date;
  reason?: string;
}

@Injectable()
export class TokenService implements OnModuleInit, OnModuleDestroy {
  private blacklistedTokens: Map<string, BlacklistedToken> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    // Cleanup expired tokens every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        this.cleanupExpiredBlacklistedTokens();
      },
      5 * 60 * 1000,
    );
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  private cleanupExpiredBlacklistedTokens(): void {
    const now = new Date();
    for (const [token, data] of this.blacklistedTokens.entries()) {
      if (data.expiresAt < now) {
        this.blacklistedTokens.delete(token);
      }
    }
  }

  generateAccessToken(payload: {
    userId: number;
    username: string;
    email: string;
  }): string {
    return this.jwtService.sign(payload, {
      expiresIn: '15m',
      secret: process.env.JWT_SECRET,
    });
  }

  async generateRefreshToken(
    userId: number,
    ipAddress?: string,
    userAgent?: string,
    parentTokenId?: number,
  ): Promise<string> {
    const token = crypto.randomBytes(64).toString('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
        ipAddress,
        userAgent,
        parentTokenId,
      },
    });

    return token;
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        token,
      },
    });
  }

  async cleanupExpiredTokens(): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
  }

  async validateRefreshToken(token: string) {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            emailVerified: true,
            isActive: true,
          },
        },
      },
    });

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (refreshToken.expiresAt < new Date()) {
      await this.deleteRefreshToken(token);
      throw new UnauthorizedException('Refresh token expired');
    }

    if (refreshToken.isRevoked) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    return refreshToken;
  }

  generateEmailVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async blacklistAccessToken(
    token: string,
    userId: number,
    expiresInSeconds: number,
    reason?: string,
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
    this.blacklistedTokens.set(token, {
      token,
      userId,
      expiresAt,
      reason: reason || 'Logout',
    });
    return Promise.resolve();
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const blacklisted = this.blacklistedTokens.get(token);
    if (!blacklisted) {
      return Promise.resolve(false);
    }

    // Check if expired
    if (blacklisted.expiresAt < new Date()) {
      this.blacklistedTokens.delete(token);
      return Promise.resolve(false);
    }

    return Promise.resolve(true);
  }

  async removeBlacklistedToken(token: string): Promise<void> {
    this.blacklistedTokens.delete(token);
    return Promise.resolve();
  }

  async blacklistAllUserTokens(
    userId: number,
    expiresInSeconds: number,
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
    // Store a pattern for all user tokens
    this.blacklistedTokens.set(`user:${userId}:*`, {
      token: `user:${userId}:*`,
      userId,
      expiresAt,
      reason: 'All sessions revoked',
    });
    return Promise.resolve();
  }
}

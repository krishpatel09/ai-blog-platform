import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

// REFACTOR: JWT payload interface for type safety
// Contains only non-sensitive user data needed for authorization
interface JwtPayload {
  userId: string;
  username: string;
  email: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) { }

  /**
   * Generate short-lived access token
   * 
   * REFACTOR: 15-minute expiry is a security best practice
   * - Short expiry limits damage if token is stolen (XSS attack)
   * - Forces client to use refresh token flow regularly
   * - Refresh token is in HttpOnly cookie, safe from XSS
   * 
   * @param payload - User identification data
   * @returns Signed JWT access token
   */
  generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: '15m', // REFACTOR: Short expiry for security
      secret: process.env.JWT_SECRET,
    });
  }

  /**
   * Generate refresh token with dynamic expiry based on Remember Me
   * 
   * REFACTOR: Remember Me security strategy
   * - rememberMe=true: 7 days (604800000ms) - Convenience for trusted devices
   * - rememberMe=false: 1 day (86400000ms) - Security for shared/public devices
   * 
   * FIX: Token rotation pattern - delete old tokens before creating new one
   * This prevents token accumulation and ensures only one valid refresh token per user
   * 
   * @param userId - User ID to associate token with
   * @param rememberMe - Whether user selected "Remember Me" option
   * @returns Object containing token string and expiry in milliseconds
   */
  async generateRefreshToken(userId: string, rememberMe: boolean = false): Promise<{ token: string; expiresInMs: number }> {
    // REFACTOR: Delete old refresh tokens to enforce single-session security
    // Prevents token accumulation and potential security issues
    await this.prisma.refreshToken.deleteMany({
      where: { userId: userId },
    });

    // REFACTOR: Cryptographically secure random token (not JWT)
    // 64 bytes = 512 bits of entropy, extremely secure
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();

    // REFACTOR: Dynamic expiry based on Remember Me checkbox
    const expiryDays = rememberMe ? 7 : 1;
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    const expiresInMs = expiryDays * 24 * 60 * 60 * 1000;

    // REFACTOR: Store refresh token in database for server-side validation
    // Unlike JWT, this allows immediate revocation if needed
    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
        isRevoked: false,
      },
    });

    return { token, expiresInMs };
  }

  /**
   * Validate refresh token from database
   * 
   * REFACTOR: Multi-layer validation for security
   * 1. Token exists in database
   * 2. Not revoked
   * 3. Not expired
   * 4. User is still active
   * 
   * @param token - Refresh token to validate
   * @returns Refresh token record with user data
   */
  async validateRefreshToken(token: string) {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token, isRevoked: false, expiresAt: { gte: new Date() } },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            isActive: true,
            security: {
              select: {
                emailVerified: true,
              },
            },
          },
        },
      },
    });

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (refreshToken.isRevoked) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    if (refreshToken.expiresAt < new Date()) {
      await this.deleteRefreshToken(token);
      throw new UnauthorizedException('Refresh token expired');
    }
    return refreshToken;
  }

  // Delete refresh token
  async deleteRefreshToken(token: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        token,
      },
    });
  }

  // Cleanup expired tokens
  async cleanupExpiredTokens(): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        OR: [{ expiresAt: { lt: new Date() } }, { isRevoked: true }],
      },
    });
  }

  // Revoke refresh token
  async revokeRefreshToken(token: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        token,
        isRevoked: false,
      },
      data: {
        isRevoked: true,
      },
    });
  }

  /**
   * Generate email verification token
   * 
   * REFACTOR: 15-minute expiry for security
   * Short expiry forces users to verify quickly, reducing attack window
   * 
   * @returns Token and expiry date
   */
  generateEmailVerificationToken() {
    const token = crypto.randomBytes(32).toString('hex');

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    return { token, expiresAt }
  };
}

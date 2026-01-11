import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

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

  //access token
  generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: '15m',
      secret: process.env.JWT_SECRET,
    });
  }

  //refresh token
  async generateRefreshToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
        isRevoked: false,
      },
    });

    return token;
  }

  // Validate refresh token
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

  generateEmailVerificationToken() {
    const token = crypto.randomBytes(32).toString('hex');

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    return { token, expiresAt }
  };
}

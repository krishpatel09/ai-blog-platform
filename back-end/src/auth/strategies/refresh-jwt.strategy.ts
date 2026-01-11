import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenService } from '../services/token.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';

interface RefreshJwtPayload {
  userId: string;
}

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
  ) {
    const secret = process.env.REFRESH_JWT_SECRET;
    if (!secret) {
      throw new Error('REFRESH_JWT_SECRET environment variable is required');
    }

    super({
      jwtFromRequest: (req: Request) => {
        return req?.cookies?.refreshToken;
      },
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: RefreshJwtPayload) {

    const refreshToken = req?.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const tokenRecord =
      await this.tokenService.validateRefreshToken(refreshToken);

    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
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
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account has been deactivated');
    }

    return {
      id: user.id,
      refreshToken,
      username: user.username,
      email: user.email,
      emailVerified: user.security?.emailVerified || false,
    };
  }
}

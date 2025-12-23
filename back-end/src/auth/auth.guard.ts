import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Observable } from 'rxjs';

interface RequestWithUser extends Request {
  user?: {
    userId: number;
    username: string;
    email: string;
  };
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const authHeader = req.headers?.authorization;

    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedException('Access token not found');
    }

    // Extract Bearer token
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;

    if (!token) {
      throw new UnauthorizedException('Access token not found');
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      if (!secret) {
        throw new Error('JWT_SECRET environment variable is required.');
      }
      // Verify access token
      const decoded = this.jwtService.verify<{
        userId: number;
        username: string;
        email: string;
      }>(token, {
        secret,
      });

      req.user = decoded;
      return true;
    } catch {
      // Token expired or invalid
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenService } from '../services/token.service';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    console.log('[RefreshTokenGuard] Checking cookies:', request.cookies);
    const token = request.cookies?.refreshToken;

    if (!token) {
      throw new UnauthorizedException('Refresh token missing');
    }

    try {
      const tokenRecord = await this.tokenService.validateRefreshToken(token);
      request.user = {
        ...tokenRecord.user,
        refreshToken: tokenRecord.token,
      };
      return true;
    } catch (error) {
      console.error('[RefreshTokenGuard] Validation failed:', error.message);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}

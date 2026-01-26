import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import type { CurrentUserType } from '../../common/decorators/current-user.decorator';

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      user?: CurrentUserType;
    }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Unauthorized access');
    }

    if (!user.emailVerified) {
      throw new ForbiddenException(
        'Email not verified. Please verify your email to access this resource.',
      );
    }

    return true;
  }
}

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import type { CurrentUserType } from '../../common/decorators/current-user.decorator';

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
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

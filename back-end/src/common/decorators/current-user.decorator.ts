import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export interface CurrentUserType {
  id: string;
  username: string;
  email: string;
  emailVerified: boolean;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserType | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: CurrentUserType }>();
    return request.user;
  },
);

// Use case
// @Get('me')
// getProfile(@CurrentUser() user: CurrentUserType) {
//   return user;
// }

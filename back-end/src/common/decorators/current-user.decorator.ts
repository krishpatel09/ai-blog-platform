import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export interface CurrentUserType {
  id: number;
  username: string;
  email: string;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserType | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: CurrentUserType }>();
    return request.user;
  },
);

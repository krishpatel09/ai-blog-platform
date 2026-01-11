import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export const ClientIp = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();

    const xForwardedFor = request.headers['x-forwarded-for'];

    if (xForwardedFor) {
      const ips = (xForwardedFor as string).split(',');
      return ips[0].trim();
    }

    return request.ip || request.socket.remoteAddress || '0.0.0.0';
  },
);

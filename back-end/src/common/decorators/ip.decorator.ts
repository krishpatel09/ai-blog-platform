import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export const ClientIp = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();

    const xForwardedFor = request.headers['x-forwarded-for'];

    let ip: string;
    if (xForwardedFor) {
      const ips = (xForwardedFor as string).split(',');
      ip = ips[0].trim();
    } else {
      ip = request.ip || request.socket.remoteAddress || '0.0.0.0';
    }

    // Normalize IPv6 localhost
    if (ip === '::1' || ip === '::ffff:127.0.0.1') {
      return '127.0.0.1';
    }

    return ip;
  },
);

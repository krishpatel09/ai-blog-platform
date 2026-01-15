import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const now = Date.now();

    // Extract IP for logging
    const xForwardedFor = request.headers['x-forwarded-for'];
    let ip = request.ip || request.socket.remoteAddress || '0.0.0.0';
    if (xForwardedFor) {
      ip = (xForwardedFor as string).split(',')[0].trim();
    }
    if (ip === '::1' || ip === '::ffff:127.0.0.1') {
      ip = '127.0.0.1';
    }

    return next.handle().pipe(
      tap(() => {
        const delay = Date.now() - now;
        this.logger.log(`${method} ${url} ${ip} ${delay}ms`);
      }),
    );
  }
}

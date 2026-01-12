import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";

@Injectable()
export class CookieInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const res = context.switchToHttp().getResponse();

        return next.handle().pipe(
            map((data) => {
                if (data?.data?.refreshToken) {
                    res.cookie('refreshToken', data.data.refreshToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'lax',
                        maxAge: data.data.expiresInMs,
                    });
                    delete data.data.refreshToken;
                    delete data.data.expiresInMs;
                }
                return data;
            }),
        );
    }
}
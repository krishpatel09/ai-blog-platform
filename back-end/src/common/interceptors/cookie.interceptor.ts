import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";

@Injectable()
export class CookieInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const res = context.switchToHttp().getResponse();

        return next.handle().pipe(
            map((data) => {
                const cookieOptions: any = {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    path: '/',
                };
                if (data?.data?.refreshToken) {
                    if (data.data.expiresInMs) {
                        cookieOptions.maxAge = data.data.expiresInMs;
                    }
                    res.cookie('refreshToken', data.data.refreshToken, cookieOptions);
                    delete data.data.refreshToken;
                    delete data.data.expiresInMs;
                }
                if (data?.action === 'LOGOUT') {
                    res.clearCookie('refreshToken');
                    delete data.action;
                }
                return data;
            }),
        );
    }
}
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('accessToken')?.value;
    const { pathname } = request.nextUrl;

    const protectedPaths = ['/dashboard', '/profile', '/settings'];
    const authPaths = ['/sign-in', '/sign-up'];

    const isProtected = protectedPaths.some(path => pathname.startsWith(path));
    const isAuthPath = authPaths.includes(pathname);

    if (isProtected && !token) {
        const loginUrl = new URL('/sign-in', request.url);
        loginUrl.searchParams.set('from', pathname);

        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete('accessToken');
        return response;
    }

    if (isAuthPath && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (pathname.startsWith('/verify-email')) {
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|images|logo).*)',
    ],
};
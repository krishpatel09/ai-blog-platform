import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// middleware.ts

export function middleware(request: NextRequest) {
  const token = request.cookies.get("refreshToken")?.value;
  const { pathname } = request.nextUrl;

  // ફેરફાર: અહીં બધા જ લોગિન પછીના રાઉટ્સ ઉમેરો
  const protectedPaths = [
    "/dashboard",
    "/profile",
    "/settings",
    "/monitaring",
    "/library",
    "/story",
  ];

  const authPaths = ["/sign-in", "/sign-up"];

  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  const isAuthPath = authPaths.includes(pathname);

  if (isProtected && !token) {
    const loginUrl = new URL("/sign-in", request.url);
    loginUrl.searchParams.set("from", pathname);

    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("refreshToken");
    return response;
  }

  if (isAuthPath && token) {
    return NextResponse.redirect(new URL("/", request.url)); // 'dashboard' ને બદલે root પર મોકલો કારણ કે આપણે '/' પર ફીડ બતાવીએ છીએ
  }

  return NextResponse.next();
}

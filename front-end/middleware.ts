import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("refreshToken")?.value;
  const { pathname } = request.nextUrl;

  const protectedPaths = [
    "/dashboard",
    "/profile",
    "/settings",
    "/monitaring",
    "/library",
    "/story",
    "/create-blog",
    "/edit-blog",
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
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

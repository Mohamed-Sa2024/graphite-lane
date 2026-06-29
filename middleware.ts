import { NextResponse, type NextRequest, type NextFetchEvent } from "next/server";
import { auth } from "@/auth";

// When OAuth is configured, protect app routes and bounce unauthenticated
// users to /login. In mock mode (no OAuth app) everything is public and the
// auth machinery is skipped entirely.
const protect = auth((req) => {
  const { pathname } = req.nextUrl;
  const isPublic =
    pathname.startsWith("/login") || pathname.startsWith("/api/auth");
  if (!req.auth && !isPublic) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }
});

export default function middleware(req: NextRequest, ev: NextFetchEvent) {
  if (!process.env.AUTH_GITHUB_ID) return NextResponse.next();
  return (protect as unknown as (
    req: NextRequest,
    ev: NextFetchEvent,
  ) => ReturnType<typeof protect>)(req, ev);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

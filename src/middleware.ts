import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Optimistic gate: cek keberadaan cookie session saja (cepat, edge).
// Verifikasi penuh (DB + role) ada di layout (admin) via requireAdmin().
export function middleware(request: NextRequest) {
  const cookie = getSessionCookie(request);
  if (!cookie) {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // Lindungi /admin. Exclude static (.*\..*), _next, dan api.
  matcher: ["/admin/:path*"],
};

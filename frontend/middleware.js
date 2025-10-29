import { NextResponse } from "next/server";

export async function middleware(request) {
  const { pathname } = new URL(request.url);
  if (pathname.startsWith("/admin")) {
    // Check role via /api/me
    const meRes = await fetch(new URL("/api/me", request.url), {
      headers: { cookie: request.headers.get("cookie") || "" },
    });
    if (!meRes.ok) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const me = await meRes.json().catch(() => null);
    if (!me || me.user_type !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/secure")) {
    const token = request.cookies.get("access_token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/secure/:path*", "/admin/:path*"],
};



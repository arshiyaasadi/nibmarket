import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Static Tanvin landings (exact HTML/CSS/JS, no App Router chrome):
 * - `/` → landing-2
 * - `/landing-legacy` → previous landing-1
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    return NextResponse.rewrite(new URL("/landing-v2/index.html", request.url));
  }

  if (pathname === "/landing-legacy" || pathname === "/landing-legacy/") {
    return NextResponse.rewrite(new URL("/landing-v1/index.html", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/landing-legacy", "/landing-legacy/"],
};

// Next.js 16 route guard — file must be named proxy.ts (not middleware.ts)
// Docs: node_modules/next/dist/docs/01-app/02-guides/authentication.md

import { NextRequest, NextResponse } from "next/server";
import { resolveAllowedRoles } from "@/config/roles";
import { ROUTES } from "@/config/routes";
import type { UserRole } from "@/types/mlm";

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin login page — public; skip redirect unless session is already an admin/manager
  if (pathname === "/admin/login") {
    const token = req.cookies.get("nib_token")?.value;
    const role = req.cookies.get("nib_role")?.value as UserRole | undefined;
    const adminRoles: UserRole[] = ["admin", "manager"];
    if (token && role && adminRoles.includes(role)) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const allowedRoles = resolveAllowedRoles(pathname);

  // Unguarded route — always pass through
  if (!allowedRoles) return NextResponse.next();

  const role = req.cookies.get("nib_role")?.value as UserRole | undefined;
  const token = req.cookies.get("nib_token")?.value;

  if (!token || !role) {
    const url = req.nextUrl.clone();
    // Admin routes redirect to admin login, others to regular login
    if (pathname.startsWith("/admin")) {
      url.pathname = "/admin/login";
    } else {
      url.pathname = ROUTES.LOGIN;
      url.searchParams.set("returnUrl", pathname);
      url.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(url);
  }

  if (!allowedRoles.includes(role)) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.startsWith("/admin") ? "/admin/login" : ROUTES.DASHBOARD;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|ico)$).*)"],
};

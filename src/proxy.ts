// Next.js 16 route guard — file must be named proxy.ts (not middleware.ts)
// Docs: node_modules/next/dist/docs/01-app/02-guides/authentication.md

import { NextRequest, NextResponse } from "next/server";
import { isAdminOpenAccess } from "@/config/admin-auth";
import { resolveAllowedRoles } from "@/config/roles";
import { ROUTES } from "@/config/routes";
import type { UserRole } from "@/types/mlm";

function loginRedirect(req: NextRequest, returnPath: string): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = ROUTES.LOGIN;
  url.searchParams.set("returnUrl", returnPath);
  url.searchParams.set("redirect", returnPath);
  return NextResponse.redirect(url);
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Legacy admin login URL — use the main login flow (role comes from auth response).
  if (pathname === "/admin/login") {
    return loginRedirect(req, ROUTES.ADMIN.ROOT);
  }

  if (isAdminOpenAccess() && pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const allowedRoles = resolveAllowedRoles(pathname);

  // Unguarded route — always pass through
  if (!allowedRoles) return NextResponse.next();

  const role = req.cookies.get("nib_role")?.value as UserRole | undefined;
  const token = req.cookies.get("nib_token")?.value;

  if (!token || !role) {
    return loginRedirect(req, pathname);
  }

  if (!allowedRoles.includes(role)) {
    const url = req.nextUrl.clone();
    url.pathname = ROUTES.DASHBOARD;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|ico)$).*)"],
};

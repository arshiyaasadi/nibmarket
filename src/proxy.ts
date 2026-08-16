// Next.js 16 route guard — file must be named proxy.ts (not middleware.ts)
// Docs: node_modules/next/dist/docs/01-app/02-guides/authentication.md

import { NextRequest, NextResponse } from "next/server";
import { resolveAllowedRoles } from "@/config/roles";
import { ROUTES } from "@/config/routes";
import { isMockDevelopmentMode } from "@/config/api-service";
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

  if (pathname === "/admin/login") {
    return loginRedirect(req, ROUTES.ADMIN.ROOT);
  }

  const allowedRoles = resolveAllowedRoles(pathname);

  if (!allowedRoles) return NextResponse.next();

  if (isMockDevelopmentMode()) {
    return NextResponse.next();
  }

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
  matcher: ["/((?!api|_next|favicon.ico|.*\\.(?:png|svg|ico|webp|jpg|jpeg|gif)$).*)"],
};

import { NextResponse } from "next/server";
import {
  DEV_ADMIN,
  isDevAdminAuthEnabled,
  isDevAdminPassword,
  isDevAdminUsername,
} from "@/config/dev-admin-auth";
import {
  COOKIE_OPTS,
  REFRESH_COOKIE_OPTS,
  createAccessToken,
  createRefreshToken,
} from "@/lib/api/server/session";

export function buildDevAdminAuthResponse(): Response {
  const token = createAccessToken({
    sub: DEV_ADMIN.id,
    role: DEV_ADMIN.role,
    mobile: DEV_ADMIN.mobile,
    referralCode: "",
  });
  const refreshToken = createRefreshToken({
    sub: DEV_ADMIN.id,
    role: DEV_ADMIN.role,
    mobile: DEV_ADMIN.mobile,
    referralCode: "",
  });

  const res = NextResponse.json({
    id: DEV_ADMIN.id,
    userId: DEV_ADMIN.id,
    fullName: DEV_ADMIN.fullName,
    mobile: DEV_ADMIN.mobile,
    email: DEV_ADMIN.email,
    role: DEV_ADMIN.role,
    token,
    refreshToken,
    balance: 0,
    wallet: {
      totalTokens: 0,
      availableTokens: 0,
      frozenTokens: 0,
      pendingTokens: 0,
    },
    recentSessions: [],
  });

  res.cookies.set("nib_token", token, COOKIE_OPTS);
  res.cookies.set("nib_role", DEV_ADMIN.role, COOKIE_OPTS);
  res.cookies.set("nib_refresh", refreshToken, REFRESH_COOKIE_OPTS);
  return res;
}

export function getDevAdminProfile() {
  return {
    fullName: DEV_ADMIN.fullName,
    mobile: DEV_ADMIN.mobile,
    email: DEV_ADMIN.email,
    birthDate: null,
    nationalId: null,
    nibMarketLinked: true,
    hasSejamIdentity: true,
    recentSessions: [],
  };
}

function unauthorized(msg = "Invalid credentials") {
  return NextResponse.json({ error: msg }, { status: 401 });
}

function badRequest(msg: string) {
  return NextResponse.json({ error: msg }, { status: 400 });
}

/** Validate username/password and issue admin session. */
export async function handleAdminLogin(req: Request): Promise<Response> {
  const body = (await req.json().catch(() => ({}))) as { username?: string; password?: string };
  const username = String(body.username ?? "").trim();
  const password = String(body.password ?? "");

  if (!username || !password) {
    return badRequest("username and password are required");
  }

  if (isDevAdminAuthEnabled() && isDevAdminUsername(username) && isDevAdminPassword(password)) {
    return buildDevAdminAuthResponse();
  }

  return unauthorized();
}

/** Short-circuit admin auth login in dev before other handlers. */
export async function tryHandleDevAdminAuth(
  routeKey: string,
  req: Request,
): Promise<Response | null> {
  if (!isDevAdminAuthEnabled()) return null;

  if (routeKey === "POST:/admin/auth/login") {
    return handleAdminLogin(req);
  }

  return null;
}

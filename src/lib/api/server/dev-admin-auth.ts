import { NextResponse } from "next/server";
import {
  DEV_ADMIN,
  isDevAdminAuthEnabled,
  isDevAdminMobile,
  isDevAdminOtp,
} from "@/config/dev-admin-auth";
import { normalizeMobile, normalizeOtp } from "@/lib/normalization/digits";
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
    recentSessions: [],
  };
}

/** Short-circuit auth routes for the dev admin mobile + OTP pair. */
export async function tryHandleDevAdminAuth(
  routeKey: string,
  req: Request,
): Promise<Response | null> {
  if (!isDevAdminAuthEnabled()) return null;

  const body = (await req
    .clone()
    .json()
    .catch(() => ({}))) as Record<string, unknown>;
  const mobile = normalizeMobile(String(body.mobile ?? ""));

  switch (routeKey) {
    case "POST:/auth/check-mobile":
      if (!isDevAdminMobile(mobile)) return null;
      return NextResponse.json({ exists: true, status: "active" });

    case "POST:/auth/otp/send":
      if (!isDevAdminMobile(mobile)) return null;
      return NextResponse.json({ success: true, expiresIn: 120 });

    case "POST:/auth/otp/verify": {
      if (!isDevAdminMobile(mobile)) return null;
      const code = normalizeOtp(String(body.code ?? ""));
      if (!isDevAdminOtp(code)) return null;
      return buildDevAdminAuthResponse();
    }

    default:
      return null;
  }
}

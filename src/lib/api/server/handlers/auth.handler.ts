import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  buildAuthPayload,
  createUserWithWallet,
  findUserById,
  findUserByLogin,
  getUserProfileDetails,
  logLoginSession,
  mobileExists,
  updatePassword,
} from "@/lib/mock/repositories/user.repository";
import { completeRegistrationMissionIfNeeded } from "@/lib/mock/repositories/mission.repository";
import {
  COOKIE_OPTS,
  REFRESH_COOKIE_OPTS,
  badRequest,
  createAccessToken,
  createRefreshToken,
  createRegistrationToken,
  getCurrentUserId,
  readRefreshToken,
  unauthorized,
  verifySignedToken,
} from "@/lib/api/server/session";
import { MOCK_OTP } from "@/config/mock-hints";
import { normalizeMobile, normalizeOtp } from "@/lib/normalization/digits";
import { isSuperAdminId, SUPER_ADMIN } from "@/config/super-admin";
import { isDevAdminId } from "@/config/dev-admin-auth";
import { buildDevAdminAuthResponse, getDevAdminProfile } from "@/lib/api/server/dev-admin-auth";
export { MOCK_OTP };

function buildSuperAdminAuthResponse() {
  const token = createAccessToken({
    sub: SUPER_ADMIN.id,
    role: "admin",
    mobile: "",
    referralCode: "",
  });
  const refreshToken = createRefreshToken({
    sub: SUPER_ADMIN.id,
    role: "admin",
    mobile: "",
    referralCode: "",
  });
  const res = NextResponse.json({
    id: SUPER_ADMIN.id,
    fullName: SUPER_ADMIN.name,
    role: "admin",
    token,
    refreshToken,
  });
  res.cookies.set("nib_token", token, COOKIE_OPTS);
  res.cookies.set("nib_role", "admin", COOKIE_OPTS);
  res.cookies.set("nib_refresh", refreshToken, REFRESH_COOKIE_OPTS);
  return res;
}

function normalizeHash(hash: string) {
  return hash.startsWith("$2y$") ? hash.replace("$2y$", "$2b$") : hash;
}

function getRequestMeta(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "127.0.0.1";
  const userAgent = req.headers.get("user-agent") ?? "Unknown";
  return { ip, userAgent };
}

export async function buildAuthResponse(userId: string, req: Request, logSession = true) {
  await completeRegistrationMissionIfNeeded(userId);

  const basePayload = await buildAuthPayload(userId, "", "");
  if (!basePayload) return unauthorized();

  const token = createAccessToken({
    sub: userId,
    role: basePayload.role,
    mobile: basePayload.mobile,
    referralCode: basePayload.referralCode,
  });
  const refreshToken = createRefreshToken({
    sub: userId,
    role: basePayload.role,
    mobile: basePayload.mobile,
    referralCode: basePayload.referralCode,
  });
  const payload = { ...basePayload, token, refreshToken };

  const res = NextResponse.json(payload);
  res.cookies.set("nib_token", token, COOKIE_OPTS);
  res.cookies.set("nib_role", payload.role, COOKIE_OPTS);
  res.cookies.set("nib_refresh", refreshToken, REFRESH_COOKIE_OPTS);
  if (logSession) {
    await logLoginSession(userId, { ...getRequestMeta(req), status: "success" });
  }
  return res;
}

export async function checkMobileHandler(req: Request): Promise<Response> {
  const body = await req.json().catch(() => ({}));
  const mobile = normalizeMobile(String(body.mobile ?? ""));
  if (!mobile) return badRequest("mobile required");
  const user = await mobileExists(mobile);
  if (!user) {
    return NextResponse.json(
      {
        error: "nib_market_required",
        message: "ابتدا باید فرایند ثبت‌نام در نیب مارکت را کامل کنید.",
      },
      { status: 403 },
    );
  }
  return NextResponse.json({ exists: true, status: user.status });
}

// POST /auth/login — password-based login
export async function loginHandler(req: Request): Promise<Response> {
  const body = await req.json().catch(() => ({}));
  const login = body.mobile
    ? normalizeMobile(String(body.mobile))
    : String(body.email ?? "").trim();
  const password = String(body.password ?? "");
  if (!login || !password) return badRequest("mobile/email and password are required");

  // Super admin bypass — config-based, no DB
  if (login === SUPER_ADMIN.email) {
    if (password !== SUPER_ADMIN.password) return unauthorized("Invalid credentials");
    return buildSuperAdminAuthResponse();
  }

  const user = await findUserByLogin(login);
  if (!user || user.status !== "active") return unauthorized("Invalid credentials");

  const ok = await bcrypt.compare(password, normalizeHash(user.password_hash));
  if (!ok) return unauthorized("Invalid credentials");

  return buildAuthResponse(user.id, req);
}

// GET /auth/profile — profile details + recent login sessions
export async function profileHandler(req: Request): Promise<Response> {
  const userId = getCurrentUserId(req);
  if (!userId) return unauthorized();
  if (isSuperAdminId(userId)) {
    return NextResponse.json({
      fullName: SUPER_ADMIN.name,
      mobile: "",
      email: SUPER_ADMIN.email,
      birthDate: null,
      nationalId: null,
      nibMarketLinked: false,
      recentSessions: [],
    });
  }
  if (isDevAdminId(userId)) {
    return NextResponse.json(getDevAdminProfile());
  }
  const profile = await getUserProfileDetails(userId);
  if (!profile) return unauthorized();
  return NextResponse.json(profile);
}

// POST /auth/otp/send — send OTP to mobile
export async function otpSendHandler(req: Request): Promise<Response> {
  const { mobile } = await req.json().catch(() => ({ mobile: "" }));
  const normalizedMobile = normalizeMobile(String(mobile));
  if (!normalizedMobile) return badRequest("mobile required");
  const user = await findUserByLogin(normalizedMobile);
  if (!user) return unauthorized("User not found");
  return NextResponse.json({ success: true, expiresIn: 120 });
}

// POST /auth/otp/verify — verify OTP and return auth tokens
export async function otpVerifyHandler(req: Request): Promise<Response> {
  const body = await req.json().catch(() => ({}));
  const login = body.mobile
    ? normalizeMobile(String(body.mobile))
    : String(body.email ?? "").trim();
  if (normalizeOtp(String(body.code ?? "")) !== MOCK_OTP) return unauthorized("invalid_otp");
  const user = await findUserByLogin(login);
  if (!user) return unauthorized("User not found");
  return buildAuthResponse(user.id, req);
}

// POST /auth/forgot/send — send OTP for password reset
export async function forgotSendHandler(req: Request): Promise<Response> {
  const { mobile } = await req.json().catch(() => ({ mobile: "" }));
  const normalizedMobile = normalizeMobile(String(mobile));
  if (!normalizedMobile) return badRequest("mobile required");
  const user = await findUserByLogin(normalizedMobile);
  if (!user) return unauthorized("User not found");
  return NextResponse.json({ success: true, expiresIn: 120 });
}

// POST /auth/forgot/verify — verify OTP for password reset
export async function forgotVerifyHandler(req: Request): Promise<Response> {
  const { code, mobile } = await req.json().catch(() => ({ code: "", mobile: "" }));
  const normalizedMobile = normalizeMobile(String(mobile));
  if (normalizeOtp(String(code)) !== MOCK_OTP) return unauthorized("invalid_otp");
  if (!normalizedMobile) return badRequest("mobile required");
  return NextResponse.json({ success: true, resetToken: "db-reset-token" });
}

// POST /auth/forgot/reset — set new password
export async function forgotResetHandler(req: Request): Promise<Response> {
  const body = await req.json().catch(() => ({}));
  const mobile = normalizeMobile(String(body.mobile ?? ""));
  const newPassword = String(body.newPassword ?? body.password ?? "");
  if (!mobile || !newPassword) return badRequest("mobile and password are required");
  const hash = await bcrypt.hash(newPassword, 12);
  const user = await updatePassword(mobile, hash);
  if (!user) return unauthorized("User not found");
  return NextResponse.json({ success: true });
}

// POST /auth/refresh — NIB account refresh (server-side) with local JWT fallback
export async function refreshHandler(req: Request): Promise<Response> {
  const cookieRefresh = readRefreshToken(req);
  const body = (await req.json().catch(() => ({}))) as { refresh?: unknown };
  const refreshToken = String(body.refresh ?? cookieRefresh ?? "").trim();

  if (refreshToken) {
    const { refreshNibAuthTokens } = await import("@/lib/auth/nib-auth");
    const {
      decodeJwtPayload,
      roleFromNibClaims,
      userIdFromNibClaims,
    } = await import("@/lib/auth/nib-jwt");

    const tokens = await refreshNibAuthTokens(refreshToken);
    if (tokens) {
      const claims = decodeJwtPayload(tokens.access);
      const userId = userIdFromNibClaims(claims) || "unknown";
      const role = roleFromNibClaims(claims, null);
      const payload = {
        token: tokens.access,
        refreshToken: tokens.refresh,
        role,
        userId,
        fullName: userId,
      };
      const res = NextResponse.json(payload);
      res.cookies.set("nib_token", tokens.access, COOKIE_OPTS);
      res.cookies.set("nib_refresh", tokens.refresh, REFRESH_COOKIE_OPTS);
      res.cookies.set("nib_role", role, COOKIE_OPTS);
      return res;
    }
  }

  // Legacy local JWT refresh (mock / admin bypass)
  const refreshClaims = verifySignedToken(cookieRefresh, "refresh");
  const userId = refreshClaims?.sub;
  if (!userId) return unauthorized();
  if (isSuperAdminId(userId)) return buildSuperAdminAuthResponse();
  if (isDevAdminId(userId)) return buildDevAdminAuthResponse();
  const user = await findUserById(userId);
  if (!user || user.status !== "active") return unauthorized();
  return buildAuthResponse(user.id, req, false);
}

function clearAccessCookies(res: NextResponse): void {
  for (const name of ["nib_token", "nib_role", "nib_auth", "nib_user_role", "nib_username"]) {
    res.cookies.set(name, "", { ...COOKIE_OPTS, maxAge: 0 });
  }
}

function clearAllAuthCookies(res: NextResponse): void {
  clearAccessCookies(res);
  res.cookies.set("nib_refresh", "", { ...REFRESH_COOKIE_OPTS, maxAge: 0 });
}

/**
 * Browser → BFF → NIB auth log_out.
 * On success: clears all auth cookies.
 * On remote failure: still ends the club UI session (access cookies) but keeps
 * `nib_refresh` so "خروج مجدد" can retry the remote call.
 */
export async function logoutHandler(req: Request): Promise<Response> {
  const refresh = readRefreshToken(req);
  const { logoutNibAuth } = await import("@/lib/auth/nib-auth");
  const { isMockDevelopmentMode } = await import("@/config/api-service");

  // Local JWT / UI mock sessions never hit NIB auth.
  const isLocalRefresh = Boolean(verifySignedToken(refresh, "refresh"));
  const result =
    isMockDevelopmentMode() || isLocalRefresh || !refresh
      ? { ok: true as const, reason: "ok" }
      : await logoutNibAuth(refresh);

  if (!result.ok) {
    const res = NextResponse.json(
      {
        ok: false,
        clubLoggedOut: true,
        reason: result.reason,
        status: result.status ?? null,
      },
      { status: 502 },
    );
    clearAccessCookies(res);
    return res;
  }

  const res = NextResponse.json({
    ok: true,
    clubLoggedOut: true,
    reason: null,
  });
  clearAllAuthCookies(res);
  return res;
}

export async function registerOtpSendHandler(req: Request): Promise<Response> {
  const body = await req.json().catch(() => ({}));
  const mobile = normalizeMobile(String(body.mobile ?? ""));
  if (!mobile) return badRequest("mobile required");
  const existing = await mobileExists(mobile);
  if (existing) {
    return NextResponse.json(
      { error: "already_registered", message: "Mobile already registered" },
      { status: 409 },
    );
  }
  return NextResponse.json({ success: true, expiresIn: 120 });
}

export async function registerOtpVerifyHandler(req: Request): Promise<Response> {
  const body = await req.json().catch(() => ({}));
  const mobile = normalizeMobile(String(body.mobile ?? ""));
  const code = normalizeOtp(String(body.code ?? ""));
  if (!mobile) return badRequest("mobile required");
  if (code !== MOCK_OTP) return unauthorized("invalid_otp");
  return NextResponse.json({
    success: true,
    registrationToken: createRegistrationToken(mobile),
  });
}

export async function registerHandler(req: Request): Promise<Response> {
  const body = await req.json().catch(() => ({}));
  const mobile = normalizeMobile(String(body.mobile ?? ""));
  const password = String(body.password ?? "");
  const referralCode = String(body.referralCode ?? body.inviteCode ?? "")
    .trim()
    .toUpperCase();
  const registrationToken = String(body.registrationToken ?? "");
  const code = normalizeOtp(String(body.code ?? ""));

  if (!mobile || !password) return badRequest("mobile and password are required");
  const existing = await mobileExists(mobile);
  if (existing) {
    return NextResponse.json(
      { error: "already_registered", message: "Mobile already registered" },
      { status: 409 },
    );
  }

  const registrationClaims = verifySignedToken(registrationToken, "registration");
  if (registrationClaims?.mobile !== mobile && code !== MOCK_OTP) {
    return unauthorized("registration_not_verified");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const user = await createUserWithWallet({
      mobile,
      passwordHash,
      referralCode: referralCode || undefined,
    });
    return buildAuthResponse(user.id, req);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("INVALID_REFERRAL_CODE")) {
      return badRequest("Invalid referral code");
    }
    throw error;
  }
}

export async function sessionEstablishHandler(req: Request): Promise<Response> {
  const body = (await req.json().catch(() => ({}))) as {
    token?: unknown;
    refreshToken?: unknown;
    role?: unknown;
  };

  const token = String(body.token ?? "").trim();
  const refreshToken = String(body.refreshToken ?? "").trim();
  const role = String(body.role ?? "client");

  if (!token || !refreshToken) {
    return badRequest("token and refreshToken are required");
  }

  const safeRole = role === "manager" || role === "admin" || role === "client" ? role : "client";

  const res = NextResponse.json({ ok: true });
  res.cookies.set("nib_token", token, COOKIE_OPTS);
  res.cookies.set("nib_refresh", refreshToken, REFRESH_COOKIE_OPTS);
  res.cookies.set("nib_role", safeRole, COOKIE_OPTS);
  return res;
}

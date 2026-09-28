import { NextResponse } from "next/server";
import { z } from "zod";
import { isMockDevelopmentMode } from "@/config/api-service";
import { clientEnv } from "@/config/env.client";
import { serverEnv } from "@/config/env.server";
import {
  badRequest,
  COOKIE_OPTS,
  REFRESH_COOKIE_OPTS,
  unauthorized,
} from "@/lib/api/server/session";
import { findOrCreateNibMarketUser } from "@/lib/mock/repositories/user.repository";
import { MOCK_MOBILE, MOCK_USER_ID } from "@/lib/mock/fixtures";
import { numericToRole } from "@/config/roles";
import type { UserRole } from "@/types/mlm";
import {
  decodeJwtPayload,
  displayNameFromNibClaims,
  roleFromNibClaims,
  userIdFromNibClaims,
} from "@/lib/auth/nib-jwt";
import { displayPersonName } from "@/lib/person-name";
import { buildAuthResponse } from "./auth.handler";

const externalTokenSchema = z
  .object({
    accessToken: z.string().optional(),
    token: z.string().optional(),
    userId: z.union([z.string(), z.number()]),
    role: z.union([z.string(), z.number()]).optional(),
    mobile: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
    name: z.string().optional().nullable(),
    fullName: z.string().optional().nullable(),
    firstName: z.string().optional().nullable(),
    lastName: z.string().optional().nullable(),
  })
  .passthrough();

function stripBearer(value: string): string {
  return value.trim().replace(/^Bearer\s+/i, "");
}

function readCookie(req: Request, name: string): string | null {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${escaped}=([^;]+)`));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

async function readEntryToken(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.trim()) return stripBearer(authHeader);

  const cookieToken = readCookie(req, clientEnv.NEXT_PUBLIC_SSO_ENTRY_COOKIE);
  if (cookieToken) return stripBearer(cookieToken);

  const body = (await req.json().catch(() => ({}))) as { token?: unknown };
  return typeof body.token === "string" && body.token.trim() ? stripBearer(body.token) : null;
}

function mapExternalRole(value: string | number | undefined): UserRole {
  if (typeof value === "number") return numericToRole(value);
  if (value === "manager" || value === "admin" || value === "client") return value;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numericToRole(numeric) : "client";
}

async function checkSsoToken(entryToken: string) {
  if (isMockDevelopmentMode()) {
    return {
      userId: MOCK_USER_ID,
      role: "client" as const,
      mobile: MOCK_MOBILE,
      email: `${MOCK_MOBILE}@nibclub.local`,
      fullName: "کاربر تستی",
      accessToken: entryToken,
    };
  }

  if (!serverEnv.SSO_CHECK_TOKEN_URL) {
    throw new Error("SSO_CHECK_TOKEN_URL is not configured");
  }

  const res = await fetch(serverEnv.SSO_CHECK_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${entryToken}`,
    },
    cache: "no-store",
  });

  if (!res.ok) return null;
  const payload = await res.json().catch(() => null);
  const parsed = externalTokenSchema.safeParse(payload);
  return parsed.success ? parsed.data : null;
}

export async function ssoExchangeHandler(req: Request): Promise<Response> {
  const entryToken = await readEntryToken(req);
  if (!entryToken) return badRequest("SSO token is missing");

  let externalUser: z.infer<typeof externalTokenSchema> | null;
  try {
    externalUser = await checkSsoToken(entryToken);
  } catch (error) {
    return NextResponse.json(
      {
        error: "sso_not_configured",
        message: error instanceof Error ? error.message : "SSO is not configured",
      },
      { status: 500 },
    );
  }

  if (!externalUser) return unauthorized("Invalid SSO token");

  const userId = await findOrCreateNibMarketUser({
    externalUserId: String(externalUser.userId),
    role: mapExternalRole(externalUser.role),
    mobile: externalUser.mobile ?? externalUser.phone,
    email: externalUser.email,
    fullName: externalUser.fullName ?? externalUser.name,
    firstName: externalUser.firstName,
    lastName: externalUser.lastName,
    metadata: {
      provider: "NIB_MARKET",
      externalAccessTokenReceived: Boolean(externalUser.accessToken ?? externalUser.token),
    },
  });

  const response = await buildAuthResponse(userId, req);
  if (response instanceof NextResponse) {
    response.cookies.delete(clientEnv.NEXT_PUBLIC_SSO_ENTRY_COOKIE);
  }
  return response;
}

/**
 * Complete SSO after NIB redirect.
 * Reads cookies set by NIB (nib_auth / nib_refresh / nib_user_role / nib_username)
 * and establishes httpOnly panel session cookies — no browser call to auth.nib*.
 */
export async function ssoCompleteHandler(req: Request): Promise<Response> {
  const access =
    readCookie(req, clientEnv.NEXT_PUBLIC_SSO_ENTRY_COOKIE) ??
    readCookie(req, "nib_auth") ??
    readCookie(req, "nib_token");
  const refresh = readCookie(req, "nib_refresh");
  const cookieRole = readCookie(req, "nib_user_role") ?? readCookie(req, "nib_role");
  const mobile = readCookie(req, "nib_username") ?? "";

  if (!access || !refresh) {
    return badRequest("SSO cookies missing (nib_auth / nib_refresh)");
  }

  const claims = decodeJwtPayload(access);
  const userId = userIdFromNibClaims(claims);
  const role = roleFromNibClaims(claims, cookieRole);
  const names = displayNameFromNibClaims(claims);
  const fullName = displayPersonName({
    firstName: names.firstName,
    lastName: names.lastName,
    fullName: names.fullName,
    fallback: "",
  });

  if (!userId) {
    return unauthorized("Invalid SSO access token");
  }

  const payload = {
    token: access,
    refreshToken: refresh,
    role,
    userId,
    fullName,
    firstName: names.firstName,
    lastName: names.lastName,
    mobile: mobile || undefined,
  };

  const res = NextResponse.json(payload);
  res.cookies.set("nib_token", access, COOKIE_OPTS);
  res.cookies.set("nib_refresh", refresh, REFRESH_COOKIE_OPTS);
  res.cookies.set("nib_role", role, COOKIE_OPTS);
  return res;
}

import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { serverEnv } from "@/config/env.server";
import type { UserRole } from "@/types/mlm";

export const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

export const REFRESH_COOKIE_OPTS = {
  ...COOKIE_OPTS,
  maxAge: 60 * 60 * 24 * 30,
};

export type TokenType = "access" | "refresh" | "registration";

export interface AuthTokenClaims {
  sub: string;
  type: TokenType;
  role?: UserRole;
  mobile?: string;
  referralCode?: string;
  tokenVersion?: string;
  iat: number;
  exp: number;
}

function encodeJson(value: unknown): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function sign(input: string): string {
  return createHmac("sha256", serverEnv.AUTH_SECRET).update(input).digest("base64url");
}

export function createSignedToken(
  claims: Omit<AuthTokenClaims, "iat" | "exp">,
  ttlSeconds: number,
): string {
  const now = Math.floor(Date.now() / 1000);
  const header = encodeJson({ alg: "HS256", typ: "JWT" });
  const payload = encodeJson({ ...claims, iat: now, exp: now + ttlSeconds });
  const unsigned = `${header}.${payload}`;
  return `${unsigned}.${sign(unsigned)}`;
}

export function createAccessToken(claims: Omit<AuthTokenClaims, "type" | "iat" | "exp">): string {
  return createSignedToken(
    { ...claims, type: "access" },
    serverEnv.ACCESS_TOKEN_TTL_SECONDS,
  );
}

export function createRefreshToken(claims: Omit<AuthTokenClaims, "type" | "iat" | "exp">): string {
  return createSignedToken(
    { ...claims, type: "refresh", tokenVersion: "v1" },
    serverEnv.REFRESH_TOKEN_TTL_SECONDS,
  );
}

export function createRegistrationToken(mobile: string): string {
  return createSignedToken(
    { sub: mobile, mobile, type: "registration" },
    10 * 60,
  );
}

export function readSessionToken(req: Request): string | null {
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  const cookieHeader = req.headers.get("cookie") ?? "";
  return cookieHeader.match(/nib_token=([^;]+)/)?.[1] ?? null;
}

export function verifySignedToken(token: string | null, expectedType?: TokenType): AuthTokenClaims | null {
  if (!token) return null;
  try {
    const [header, payload, signature] = token.split(".");
    if (!header || !payload || !signature) return null;

    const unsigned = `${header}.${payload}`;
    const expected = sign(unsigned);
    const actualBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (
      actualBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(actualBuffer, expectedBuffer)
    ) {
      return null;
    }

    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AuthTokenClaims;
    if (expectedType && claims.type !== expectedType) return null;
    if (claims.exp <= Math.floor(Date.now() / 1000)) return null;
    return claims;
  } catch {
    return null;
  }
}

export function getCurrentUserId(req: Request): string | null {
  return verifySignedToken(readSessionToken(req), "access")?.sub ?? null;
}

export function readRefreshToken(req: Request): string | null {
  const cookieHeader = req.headers.get("cookie") ?? "";
  return cookieHeader.match(/nib_refresh=([^;]+)/)?.[1] ?? null;
}

export function unauthorized(message = "Unauthorized"): Response {
  return NextResponse.json({ error: "unauthorized", message }, { status: 401 });
}

export function badRequest(message: string): Response {
  return NextResponse.json({ error: "bad_request", message }, { status: 400 });
}

export function notFound(message = "Not found"): Response {
  return NextResponse.json({ error: "not_found", message }, { status: 404 });
}

export function emptyPage<T>(items: T[] = [], page = 1, limit = 10) {
  return { items, total: items.length, page, limit };
}

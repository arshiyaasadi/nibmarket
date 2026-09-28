import { numericToRole } from "@/config/roles";
import type { UserRole } from "@/types/mlm";

/** Decode JWT payload without verifying signature (claims only). */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.trim().split(".");
    if (parts.length < 2) return null;
    const json = Buffer.from(parts[1]!, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function roleFromNibClaims(
  payload: Record<string, unknown> | null,
  cookieRole?: string | null,
): UserRole {
  if (cookieRole === "manager" || cookieRole === "admin" || cookieRole === "client") {
    return cookieRole;
  }
  const raw = payload?.role;
  if (typeof raw === "number") return numericToRole(raw);
  if (typeof raw === "string") {
    if (raw === "manager" || raw === "admin" || raw === "client") return raw;
    const n = Number(raw);
    if (Number.isFinite(n)) return numericToRole(n);
  }
  return "client";
}

export function userIdFromNibClaims(payload: Record<string, unknown> | null): string {
  if (!payload) return "";
  const raw = payload.user_id ?? payload.userId ?? payload.sub ?? payload.id;
  return raw != null && String(raw).trim() ? String(raw) : "";
}

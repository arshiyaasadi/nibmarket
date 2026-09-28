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

/** Best-effort display name from NIB JWT claims (never prefer phone). */
export function displayNameFromNibClaims(payload: Record<string, unknown> | null): {
  firstName?: string;
  lastName?: string;
  fullName: string;
} {
  if (!payload) return { fullName: "" };
  const firstName = String(
    payload.first_name ?? payload.firstName ?? payload.given_name ?? "",
  ).trim();
  const lastName = String(
    payload.last_name ?? payload.lastName ?? payload.family_name ?? "",
  ).trim();
  const combined = `${firstName} ${lastName}`.trim();
  const fullName = String(
    combined || payload.full_name || payload.fullName || payload.name || "",
  ).trim();
  return {
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    fullName,
  };
}

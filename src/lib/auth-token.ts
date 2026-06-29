import { env } from "@/config/env";

export function stripBearer(value: string): string {
  return value.trim().replace(/^Bearer\s+/i, "");
}

export function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${escaped}=([^;]+)`));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function readSsoCookie(): string | null {
  const value = readCookie(env.SSO_ENTRY_COOKIE);
  return value ? stripBearer(value) : null;
}

export function extractTokenInput(value: string): string {
  const raw = value.trim();
  if (!raw) return "";

  try {
    const url = new URL(raw);
    const token = url.searchParams.get("token")
      ?? url.searchParams.get("sso_token")
      ?? url.searchParams.get("accessToken");
    if (token) return stripBearer(token);
  } catch {
    // Not a URL; treat it as a raw token.
  }

  return stripBearer(raw);
}

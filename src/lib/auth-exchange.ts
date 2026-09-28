import { ENDPOINTS, BFF_API_BASE } from "@/lib/api/endpoints";
import { extractTokenInput, resolveSsoEntryToken } from "@/lib/auth-token";
import { normalizeAuthSessionPayload, type AuthSessionPayload } from "@/lib/auth/session-payload";

export type { AuthSessionPayload };

export async function exchangeSsoToken(rawToken?: string): Promise<AuthSessionPayload> {
  const token = rawToken ? extractTokenInput(rawToken) : resolveSsoEntryToken();
  const res = await fetch(`${BFF_API_BASE}${ENDPOINTS.AUTH.SSO_EXCHANGE}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    ...(token ? { body: JSON.stringify({ token }) } : {}),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(String(data.message ?? data.error ?? "sso_exchange_failed"));
  }

  const payload = await res.json();
  return normalizeAuthSessionPayload(payload);
}

/**
 * After NIB SSO redirect: BFF reads nib_auth / nib_refresh cookies and sets httpOnly session.
 * Browser never calls auth.nibdev.com / auth.nibmarket.com directly.
 */
export async function completeSsoSession(): Promise<AuthSessionPayload> {
  const res = await fetch(`${BFF_API_BASE}${ENDPOINTS.AUTH.SSO_COMPLETE}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(String(data.message ?? data.error ?? "sso_complete_failed"));
  }

  const payload = await res.json();
  return normalizeAuthSessionPayload(payload);
}

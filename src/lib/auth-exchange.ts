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

import { ENDPOINTS, BFF_API_BASE } from "@/lib/api/endpoints";
import { extractTokenInput, readSsoCookie } from "@/lib/auth-token";
import type { LoginActivity, UserRole } from "@/types/mlm";

export interface AuthSessionPayload {
  token: string;
  refreshToken: string;
  role: UserRole;
  userId: string;
  fullName: string;
  mobile?: string;
  email?: string;
  inviteCode?: string;
  referralCode?: string;
  balance?: number;
  recentSessions?: LoginActivity[];
}

export async function exchangeSsoToken(rawToken?: string): Promise<AuthSessionPayload> {
  const token = rawToken ? extractTokenInput(rawToken) : readSsoCookie();
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

  return res.json() as Promise<AuthSessionPayload>;
}

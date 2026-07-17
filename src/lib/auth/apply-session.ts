import { BFF_API_BASE, ENDPOINTS } from "@/lib/api/endpoints";
import type { WalletSummary } from "@/types/mlm";
import type { AuthSliceActions } from "@/store/types/store.types";
import {
  normalizeAuthSessionPayload,
  toAuthStorePayload,
  type AuthSessionPayload,
} from "./session-payload";

async function establishAuthSession(session: AuthSessionPayload): Promise<void> {
  const res = await fetch(`${BFF_API_BASE}/auth/session/establish`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: session.token,
      refreshToken: session.refreshToken,
      role: session.role,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(String(data.message ?? data.error ?? "session_establish_failed"));
  }
}

async function prefetchWalletSummary(setWallet: AuthSliceActions["setWallet"]): Promise<void> {
  try {
    const { apiClient } = await import("@/lib/api/client");
    const wallet = await apiClient.get<WalletSummary>(ENDPOINTS.DASHBOARD.WALLET);
    setWallet(wallet);
  } catch {
    // Dashboard queries will load wallet data on the next page.
  }
}

export async function applyAuthSession(
  raw: unknown,
  actions: Pick<AuthSliceActions, "setAuth" | "setWallet">,
): Promise<AuthSessionPayload> {
  const session = normalizeAuthSessionPayload(raw);

  if (!session.token || !session.refreshToken || !session.userId) {
    throw new Error("invalid_session_payload");
  }

  await establishAuthSession(session);
  actions.setAuth(toAuthStorePayload(session));
  if (session.role === "client") {
    void prefetchWalletSummary(actions.setWallet);
  }

  return session;
}

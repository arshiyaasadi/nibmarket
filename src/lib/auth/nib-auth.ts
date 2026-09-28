import { serverEnv } from "@/config/env.server";

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

/** Server-only NIB account auth base (never call from the browser). */
export function getServerAuthBaseUrl(): string {
  return trimTrailingSlash(serverEnv.AUTH_BASE_URL);
}

export function getServerRefreshTokenUrl(): string {
  return `${getServerAuthBaseUrl()}/api/v1/account/refresh_token/`;
}

export function getServerLogOutUrl(): string {
  return `${getServerAuthBaseUrl()}/api/v1/account/log_out/`;
}

export type NibAuthTokens = {
  access: string;
  refresh: string;
};

/**
 * Exchange refresh token via NIB auth service (server-side).
 * POST { refresh } → { refresh, access }
 */
export async function refreshNibAuthTokens(refresh: string): Promise<NibAuthTokens | null> {
  const token = refresh.trim();
  if (!token) return null;

  const res = await fetch(getServerRefreshTokenUrl(), {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh: token }),
    cache: "no-store",
  }).catch(() => null);

  if (!res?.ok) return null;

  const data = (await res.json().catch(() => null)) as {
    access?: unknown;
    refresh?: unknown;
  } | null;

  const access = String(data?.access ?? "").trim();
  const nextRefresh = String(data?.refresh ?? "").trim();
  if (!access || !nextRefresh) return null;

  return { access, refresh: nextRefresh };
}

/**
 * Invalidate session on NIB auth service (server-side).
 * GET with header Refresh: <refresh_token>
 */
export async function logoutNibAuth(refresh: string | null | undefined): Promise<void> {
  const token = String(refresh ?? "").trim();
  if (!token) return;

  await fetch(getServerLogOutUrl(), {
    method: "GET",
    headers: {
      accept: "application/json",
      Refresh: token,
    },
    cache: "no-store",
  }).catch(() => {});
}

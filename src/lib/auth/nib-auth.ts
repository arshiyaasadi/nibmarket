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

export type NibLogoutResult = {
  ok: boolean;
  /** Human-readable reason when ok is false (Persian-friendly for UI). */
  reason: string;
  status?: number;
};

/**
 * Invalidate session on NIB auth service (server-side).
 * GET with header Refresh: <refresh_token>
 */
export async function logoutNibAuth(
  refresh: string | null | undefined,
): Promise<NibLogoutResult> {
  const token = String(refresh ?? "").trim();
  if (!token) {
    return { ok: true, reason: "no_refresh_token" };
  }

  const url = getServerLogOutUrl();
  let res: Response | null = null;
  try {
    res = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        Refresh: token,
      },
      cache: "no-store",
    });
  } catch {
    return {
      ok: false,
      reason: "ارتباط با سرویس احراز هویت برقرار نشد.",
    };
  }

  if (res.ok) {
    return { ok: true, reason: "ok", status: res.status };
  }

  const bodyText = await res.text().catch(() => "");
  let detail = "";
  try {
    const parsed = JSON.parse(bodyText) as { message?: unknown; detail?: unknown; error?: unknown };
    detail = String(parsed.message ?? parsed.detail ?? parsed.error ?? "").trim();
  } catch {
    detail = bodyText.trim().slice(0, 200);
  }

  const reason = detail
    ? `سرویس احراز هویت خطا داد (${res.status}): ${detail}`
    : `سرویس احراز هویت با وضعیت ${res.status} پاسخ داد.`;

  return { ok: false, reason, status: res.status };
}

import { env } from "@/config/env";
import { getPublicClubOrigin } from "@/config/public-origin";

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function withLeadingSlash(value: string): string {
  return value.startsWith("/") ? value : `/${value}`;
}

export function getSsoCallbackPath(): string {
  return withLeadingSlash(env.SSO_CALLBACK_PATH || "/login/sso");
}

export type SsoCallbackParams = {
  /** Upline invite / referral code from SMS invite link */
  inviteCode?: string | null;
  /** Optional fund suggested in the invite SMS */
  fundId?: string | null;
  /** Post-login path on club (e.g. /invite/welcome?code=…) */
  returnUrl?: string | null;
  redirect?: string | null;
};

/** Club SSO callback URL, optionally carrying invite + return path for panel. */
export function getSsoCallbackUrl(params?: SsoCallbackParams): string {
  const path = getSsoCallbackPath();
  const normalizedPath = path.endsWith("/") ? path : `${path}/`;
  const origin = getPublicClubOrigin();
  const base = origin ? `${origin}${normalizedPath}` : normalizedPath;

  const search = new URLSearchParams();
  const inviteCode = String(params?.inviteCode ?? "").trim();
  const fundId = String(params?.fundId ?? "").trim();
  const returnUrl = String(params?.returnUrl ?? "").trim();
  const redirect = String(params?.redirect ?? "").trim();

  if (inviteCode) search.set("inviteCode", inviteCode);
  if (fundId) search.set("fundId", fundId);
  if (returnUrl) {
    search.set("returnUrl", returnUrl);
    search.set("redirect", redirect || returnUrl);
  } else if (redirect) {
    search.set("redirect", redirect);
  }

  const qs = search.toString();
  return qs ? `${base}?${qs}` : base;
}

function appendCallbackUrl(base: string, callbackUrl: string): string {
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}callbackUrl=${encodeURIComponent(callbackUrl)}`;
}

/** Panel login URL without callbackUrl (used after logout). */
export function getPanelLoginUrlBare(): string {
  if (env.PANEL_LOGIN_URL) {
    return env.PANEL_LOGIN_URL;
  }
  if (!env.PANEL_BASE_URL) {
    return "/login/token";
  }
  return `${trimTrailingSlash(env.PANEL_BASE_URL)}/login/`;
}

export function getPanelLoginUrl(params?: SsoCallbackParams): string {
  const callbackUrl = getSsoCallbackUrl(params);
  return appendCallbackUrl(getPanelLoginUrlBare(), callbackUrl);
}

export function getPanelProfileUrl(): string | undefined {
  return env.PANEL_PROFILE_URL;
}

export function getPanelUserAccountUrl(): string | undefined {
  return env.PANEL_USER_ACCOUNT_URL;
}

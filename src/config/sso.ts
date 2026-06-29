import { env } from "@/config/env";

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function withLeadingSlash(value: string): string {
  return value.startsWith("/") ? value : `/${value}`;
}

export function getSsoCallbackPath(): string {
  return withLeadingSlash(env.SSO_CALLBACK_PATH || "/login/sso");
}

export function getSsoCallbackUrl(): string {
  return `${trimTrailingSlash(env.APP_URL)}${getSsoCallbackPath()}`;
}

export function getPanelLoginUrl(returnUrl?: string): string {
  const callback = new URL(getSsoCallbackUrl());
  if (returnUrl) callback.searchParams.set("returnUrl", returnUrl);

  if (env.PANEL_LOGIN_URL) {
    const url = new URL(env.PANEL_LOGIN_URL);
    url.searchParams.set("callbackUrl", callback.toString());
    return url.toString();
  }

  if (!env.PANEL_BASE_URL) {
    return "/login/token";
  }

  const baseUrl = trimTrailingSlash(env.PANEL_BASE_URL);
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}callbackUrl=${encodeURIComponent(callback.toString())}`;
}

export function getPanelProfileUrl(): string | undefined {
  return env.PANEL_PROFILE_URL;
}

export function getPanelUserAccountUrl(): string | undefined {
  return env.PANEL_USER_ACCOUNT_URL;
}

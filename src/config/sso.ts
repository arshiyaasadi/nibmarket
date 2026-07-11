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
  const path = getSsoCallbackPath();
  const normalizedPath = path.endsWith("/") ? path : `${path}/`;
  return `${trimTrailingSlash(env.APP_URL)}${normalizedPath}`;
}

function appendCallbackUrl(base: string, callbackUrl: string): string {
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}callbackUrl=${callbackUrl}`;
}

export function getPanelLoginUrl(): string {
  const callbackUrl = getSsoCallbackUrl();

  if (env.PANEL_LOGIN_URL) {
    return appendCallbackUrl(env.PANEL_LOGIN_URL, callbackUrl);
  }

  if (!env.PANEL_BASE_URL) {
    return "/login/token";
  }

  const panelLoginUrl = `${trimTrailingSlash(env.PANEL_BASE_URL)}/login/`;
  return appendCallbackUrl(panelLoginUrl, callbackUrl);
}

export function getPanelProfileUrl(): string | undefined {
  return env.PANEL_PROFILE_URL;
}

export function getPanelUserAccountUrl(): string | undefined {
  return env.PANEL_USER_ACCOUNT_URL;
}

import { env } from "@/config/env";

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

/** NIB account auth API base (nibdev / nibmarket). */
export function getAuthBaseUrl(): string {
  return trimTrailingSlash(env.AUTH_BASE_URL);
}

export function getRefreshTokenUrl(): string {
  return `${getAuthBaseUrl()}/api/v1/account/refresh_token/`;
}

export function getLogOutUrl(): string {
  return `${getAuthBaseUrl()}/api/v1/account/log_out/`;
}

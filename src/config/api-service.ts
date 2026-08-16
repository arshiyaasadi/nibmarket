import { serverEnv } from "@/config/env.server";
import { BACKEND_API_VERSION as DEFAULT_BACKEND_VERSION } from "@/lib/api/endpoints";

export type ApiServiceMode = "mock" | "api";

export function getApiServiceMode(): ApiServiceMode {
  if (isMockDevelopmentMode()) return "mock";
  return serverEnv.API_SERVICE_MODE;
}

export function isApiServiceMode(): boolean {
  return getApiServiceMode() === "api";
}

export function isMockServiceMode(): boolean {
  return getApiServiceMode() === "mock";
}

/**
 * UI-only development mode: all data stays inside the local BFF and auth guards
 * may use the fixed mock identity. It is intentionally impossible in production.
 */
export function isMockDevelopmentMode(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  return process.env.UI_DEV_MODE === "1" || process.env.NEXT_PUBLIC_UI_DEV_MODE === "1";
}

function getBackendApiVersion(): string {
  return serverEnv.BACKEND_API_VERSION || DEFAULT_BACKEND_VERSION;
}

/** Strips trailing slashes and any `/api/vN` suffix accidentally included in base URL. */
function normalizeBackendBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "").replace(/\/api\/v\d+$/, "");
}

function normalizeApiPath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

/** Maps a BFF path (e.g. `/wallet/summary`) to the external backend URL. */
export function buildBackendApiUrl(path: string): string {
  const version = getBackendApiVersion();
  const normalizedPath = normalizeApiPath(path);

  if (serverEnv.BACKEND_API_URL) {
    const legacyBase = normalizeBackendBaseUrl(serverEnv.BACKEND_API_URL);
    return `${legacyBase}/api/${version}${normalizedPath}`;
  }

  const base = normalizeBackendBaseUrl(serverEnv.BACKEND_API_BASE_URL);
  return `${base}/api/${version}${normalizedPath}`;
}

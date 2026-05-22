import authConfig from 'src/configs/auth'

/** Backend origin from env (used for Next.js rewrites and server-side calls). */
export const API_BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'https://api-club.nibdev.com'

/**
 * Axios base URL. In the browser, cross-origin calls drop Authorization (CORS);
 * use same-origin '' so Next rewrites /api/v1/* → API_BACKEND_URL.
 */
export function resolveApiBaseUrl(): string {
  if (typeof window === 'undefined') return API_BACKEND_URL

  if (process.env.NEXT_PUBLIC_API_USE_PROXY === 'false') return API_BACKEND_URL

  try {
    const backendHost = new URL(API_BACKEND_URL).host
    if (backendHost && backendHost !== window.location.host) return ''
  } catch {
    /* invalid URL — use as-is */
  }

  return API_BACKEND_URL
}

export const API_BASE_URL = resolveApiBaseUrl()

/** Version segment inserted after /api/ → /api/dashboard/... becomes /api/v1/dashboard/... */
export const API_VERSION_PREFIX = '/api/v1'

/** Cookie name aligned with auth localStorage key */
export const ACCESS_TOKEN_COOKIE = authConfig.storageTokenKeyName

/** External SSO token for dev — exchanged via check_token; not sent to other APIs. */
export const ENV_ENTRY_TOKEN = process.env.NEXT_PUBLIC_USER_TOKEN?.trim() || ''

/** @deprecated Use ENV_ENTRY_TOKEN — kept for imports that expect ENV_USER_TOKEN */
export const ENV_USER_TOKEN = ENV_ENTRY_TOKEN

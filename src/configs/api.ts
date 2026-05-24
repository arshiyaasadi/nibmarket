import authConfig from 'src/configs/auth'

/** Backend origin from env (used for Next.js rewrites and server-side calls). */
export const API_BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'https://api-club.nibdev.com'

/** Whether the browser should call same-origin /api/v1 (proxied by Next route handler). */
export function isApiProxyMode(): boolean {
  return process.env.NEXT_PUBLIC_API_USE_PROXY === 'true'
}

/**
 * Axios base URL in the browser.
 * Proxy mode: same-origin (window.location.origin) → app/api/v1/[...path]/route.ts → backend.
 * Direct mode: NEXT_PUBLIC_API_BASE_URL (needs CORS on the API).
 */
export function resolveApiBaseUrl(): string {
  if (typeof window === 'undefined') return API_BACKEND_URL

  if (isApiProxyMode()) {
    try {
      const backendHost = new URL(API_BACKEND_URL).host
      if (backendHost && backendHost !== window.location.host) {
        return window.location.origin
      }
    } catch {
      return API_BACKEND_URL
    }
  }

  return API_BACKEND_URL
}

export const API_BASE_URL = resolveApiBaseUrl()

/** Version segment inserted after /api/ → /api/dashboard/... becomes /api/v1/dashboard/... */
export const API_VERSION_PREFIX = '/api/v1'

/** Cookie name aligned with auth localStorage key */
export const ACCESS_TOKEN_COOKIE = authConfig.storageTokenKeyName

/** SSO token from panel.nibdev.com — read on `/` once, then redirect to /login/token/… */
export const NIB_AUTH_COOKIE = 'nib_auth'

/** External SSO token for dev — exchanged via check_token; not sent to other APIs. */
export const ENV_ENTRY_TOKEN = process.env.NEXT_PUBLIC_USER_TOKEN?.trim() || ''

/** @deprecated Use ENV_ENTRY_TOKEN — kept for imports that expect ENV_USER_TOKEN */
export const ENV_USER_TOKEN = ENV_ENTRY_TOKEN

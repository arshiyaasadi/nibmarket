import authConfig from 'src/configs/auth'

/** Backend origin from env (used for Next.js rewrites and server-side calls). */
export const API_BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'https://api-club.nibdev.com'

/** Full URL for an API path (browser + server). */
export function buildApiUrl(path: string): string {
  const normalized = path.startsWith('/api/v1/')
    ? path
    : path.replace(/^\/api\//, '/api/v1/')

  return `${API_BACKEND_URL}${normalized.startsWith('/') ? normalized : `/${normalized}`}`
}

/**
 * Axios base URL — always the backend origin (client → api-club directly).
 * Ignores NEXT_PUBLIC_API_USE_PROXY so a stale build cannot send API calls to the Next origin.
 */
export function resolveApiBaseUrl(): string {
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

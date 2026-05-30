import Cookies from 'js-cookie'

import authConfig from 'src/configs/auth'
import { ACCESS_TOKEN_COOKIE, NIB_AUTH_COOKIE } from 'src/configs/api'

const ENTRY_TOKEN_STORAGE_KEY = 'ssoEntryToken'

const COOKIE_OPTIONS: Cookies.CookieAttributes = {
  sameSite: 'lax',
  secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
  path: '/'
}

/** Strip Bearer prefix; return raw JWT/string. */
export function stripBearerPrefix(token: string): string {
  const trimmed = token.trim()
  if (trimmed.toLowerCase().startsWith('bearer ')) {
    return trimmed.slice(7).trim()
  }

  return trimmed
}

export function toAuthorizationHeader(token: string): string {
  const raw = stripBearerPrefix(token)
  if (!raw) return ''

  return `Bearer ${raw}`
}

function normalizeToken(token: string): string {
  return toAuthorizationHeader(token)
}

/** Read session accessToken from localStorage (post check_token). */
function getTokenFromLocalStorage(): string | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(authConfig.storageTokenKeyName)
  if (!raw?.trim()) return null

  return normalizeToken(raw)
}

/** Panel SSO JWT from nib_auth cookie — exchanged via check_token only. */
export function getNibAuthCookieToken(): string | null {
  if (typeof document === 'undefined') return null

  const fromJsCookie = Cookies.get(NIB_AUTH_COOKIE)
  if (fromJsCookie?.trim()) {
    return stripBearerPrefix(fromJsCookie)
  }

  const prefix = `${NIB_AUTH_COOKIE}=`
  for (const part of document.cookie.split(';')) {
    const trimmed = part.trim()
    if (!trimmed.startsWith(prefix)) continue

    const raw = trimmed.slice(prefix.length)
    try {
      const decoded = decodeURIComponent(raw).trim()
      if (decoded) return stripBearerPrefix(decoded)
    } catch {
      if (raw.trim()) return stripBearerPrefix(raw)
    }
  }

  return null
}

/** Read session accessToken from cookie. */
function getTokenFromCookie(): string | null {
  const raw = Cookies.get(ACCESS_TOKEN_COOKIE)
  if (!raw?.trim()) return null

  return normalizeToken(raw)
}

export function clearEntryToken(): void {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(ENTRY_TOKEN_STORAGE_KEY)
}

/** Which store supplied the session token (no token value). */
export function getAccessTokenSource(): 'localStorage' | 'cookie' | 'none' {
  if (getTokenFromLocalStorage()) return 'localStorage'
  if (getTokenFromCookie()) return 'cookie'

  return 'none'
}

/**
 * Session token for API calls (after check_token).
 * Does not return SSO entry tokens; those are exchanged only by explicit login flows.
 */
export function getAccessToken(): string | null {
  return getTokenFromLocalStorage() || getTokenFromCookie()
}

/** Persist accessToken from check_token as the app session token. */
export function persistSessionAccessToken(accessToken: string): void {
  if (typeof window === 'undefined') return
  const raw = stripBearerPrefix(accessToken)
  if (!raw) return

  window.localStorage.setItem(authConfig.storageTokenKeyName, raw)
  Cookies.set(ACCESS_TOKEN_COOKIE, normalizeToken(raw), COOKIE_OPTIONS)
}

export function clearSessionTokens(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(authConfig.storageTokenKeyName)
  window.localStorage.removeItem('userData')
  window.localStorage.removeItem('refreshToken')
  Cookies.remove(ACCESS_TOKEN_COOKIE)
}

export function setAccessTokenCookie(token: string): void {
  persistSessionAccessToken(token)
}

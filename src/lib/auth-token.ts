import Cookies from 'js-cookie'

import authConfig from 'src/configs/auth'
import { ACCESS_TOKEN_COOKIE, ENV_USER_TOKEN } from 'src/configs/api'

const COOKIE_OPTIONS: Cookies.CookieAttributes = {
  sameSite: 'lax',
  secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
  path: '/'
}

function normalizeToken(token: string): string {
  const trimmed = token.trim()
  if (!trimmed) return ''
  if (trimmed.toLowerCase().startsWith('bearer ')) return trimmed

  return `Bearer ${trimmed}`
}

/** Read token from localStorage (logged-in user). */
function getTokenFromLocalStorage(): string | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(authConfig.storageTokenKeyName)
  if (!raw?.trim()) return null

  return normalizeToken(raw)
}

/** Read token from cookie. */
function getTokenFromCookie(): string | null {
  const raw = Cookies.get(ACCESS_TOKEN_COOKIE)
  if (!raw?.trim()) return null

  return normalizeToken(raw)
}

/**
 * Priority: localStorage (user login) → cookie → env NEXT_PUBLIC_USER_TOKEN
 */
export function getAccessToken(): string | null {
  return getTokenFromLocalStorage() || getTokenFromCookie() || (ENV_USER_TOKEN ? normalizeToken(ENV_USER_TOKEN) : null)
}

/**
 * If no user token exists, persist env token to cookie for subsequent API calls.
 */
export function ensureAccessToken(): void {
  if (typeof window === 'undefined') return

  if (getTokenFromLocalStorage() || getTokenFromCookie()) return

  if (ENV_USER_TOKEN) {
    Cookies.set(ACCESS_TOKEN_COOKIE, normalizeToken(ENV_USER_TOKEN), COOKIE_OPTIONS)
  }
}

export function setAccessTokenCookie(token: string): void {
  Cookies.set(ACCESS_TOKEN_COOKIE, normalizeToken(token), COOKIE_OPTIONS)
}

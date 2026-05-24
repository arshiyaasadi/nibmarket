import { stripBearerPrefix } from 'src/lib/auth-token'

const NIB_AUTH_SSO_ATTEMPT_KEY = 'nibAuthSsoAttempted'

/** Parse SSO entry token from `/login/token/{token}` (with or without trailing slash). */
export function extractTokenFromLoginPath(pathname: string): string | null {
  const match = pathname.match(/\/login\/token\/([^/?#]+)/i)
  if (!match?.[1]) return null

  return stripBearerPrefix(decodeURIComponent(match[1]))
}

export function isLoginTokenPath(pathname: string): boolean {
  return /\/login\/token\//i.test(pathname)
}

export function buildLoginTokenPath(token: string): string {
  const raw = stripBearerPrefix(token)
  if (!raw) return '/'

  return `/login/token/${encodeURIComponent(raw)}/`
}

export function hasAttemptedNibAuthSso(): boolean {
  if (typeof window === 'undefined') return false

  return window.sessionStorage.getItem(NIB_AUTH_SSO_ATTEMPT_KEY) === '1'
}

export function markNibAuthSsoAttempted(): void {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(NIB_AUTH_SSO_ATTEMPT_KEY, '1')
}

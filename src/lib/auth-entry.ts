import { stripBearerPrefix } from 'src/lib/auth-token'

/** Routes that skip SSO panel redirect (manual / dev login). */
export const AUTH_PUBLIC_PATH_PREFIXES = [
  '/login',
  '/health',
  '/invite',
  '/version',
  '/api/'
] as const

export function isAuthPublicPath(pathname: string): boolean {
  const path = pathname || '/'

  return AUTH_PUBLIC_PATH_PREFIXES.some(prefix => path === prefix || path.startsWith(`${prefix}/`))
}

/** Parse SSO entry token from `/login/token/{token}` (with or without trailing slash). */
export function extractTokenFromLoginPath(pathname: string): string | null {
  const match = pathname.match(/\/login\/token\/([^/?#]+)/i)
  if (!match?.[1]) return null

  return stripBearerPrefix(decodeURIComponent(match[1]))
}

/** Normalize pasted token, Bearer prefix, or login URL from the manual login form. */
export function parseLoginTokenInput(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''

  const fromPath = extractTokenFromLoginPath(trimmed)
  if (fromPath) return fromPath

  try {
    const url = new URL(trimmed)
    const queryToken = url.searchParams.get('token')?.trim()
    if (queryToken) return stripBearerPrefix(queryToken)
  } catch {
    // Plain JWT / Bearer string.
  }

  return stripBearerPrefix(trimmed)
}

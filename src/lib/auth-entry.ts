import { stripBearerPrefix } from 'src/lib/auth-token'

/** Parse SSO entry token from `/login/token/{token}` (with or without trailing slash). */
export function extractTokenFromLoginPath(pathname: string): string | null {
  const match = pathname.match(/\/login\/token\/([^/?#]+)/i)
  if (!match?.[1]) return null

  return stripBearerPrefix(decodeURIComponent(match[1]))
}

export function isLoginTokenPath(pathname: string): boolean {
  return /\/login\/token\//i.test(pathname)
}

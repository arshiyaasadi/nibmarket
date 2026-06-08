import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { ACCESS_TOKEN_COOKIE, NIB_AUTH_COOKIE } from 'src/configs/api'
import { PANEL_LOGIN_URL } from 'src/configs/auth-redirect'

function hasCookieValue(request: NextRequest, name: string): boolean {
  return Boolean(request.cookies.get(name)?.value?.trim())
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isRoot = pathname === '/' || pathname === ''

  if (!isRoot) {
    return NextResponse.next()
  }

  const hasSessionToken = hasCookieValue(request, ACCESS_TOKEN_COOKIE)
  const hasSsoToken = hasCookieValue(request, NIB_AUTH_COOKIE)

  if (hasSessionToken || hasSsoToken) {
    return NextResponse.next()
  }

  return NextResponse.redirect(PANEL_LOGIN_URL)
}

export const config = {
  matcher: ['/']
}

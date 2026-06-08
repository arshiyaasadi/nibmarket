import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Auth entry is handled client-side on `/` (RootEntryClient) so localStorage session
 * is respected. Middleware must not redirect to the panel — that would skip the client
 * and break sessions stored only in localStorage (cross-subdomain cookie mismatch).
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/']
}

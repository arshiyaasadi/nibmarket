'use client'

import { useEffect } from 'react'

import { ensureAccessToken } from 'src/lib/auth-token'

/**
 * Runs once on client mount to seed cookie from NEXT_PUBLIC_USER_TOKEN when needed.
 */
export default function ApiBootstrap() {
  useEffect(() => {
    ensureAccessToken()
  }, [])

  return null
}

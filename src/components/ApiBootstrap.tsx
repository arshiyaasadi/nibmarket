'use client'

import { useEffect } from 'react'

import { seedEntryTokenFromEnv } from 'src/lib/auth-token'

/**
 * Seeds dev SSO entry token from env when no session exists.
 * AuthProvider exchanges it via /api/v1/auth/check_token before API calls use accessToken.
 */
export default function ApiBootstrap() {
  useEffect(() => {
    seedEntryTokenFromEnv()
  }, [])

  return null
}

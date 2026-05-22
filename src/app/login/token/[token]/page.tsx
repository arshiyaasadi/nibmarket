'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

import Spinner from 'src/@core/components/spinner'
import { setEntryToken } from 'src/lib/auth-token'

/**
 * SSO entry: store foreign token and send user to dashboard.
 * AuthProvider exchanges it via /api/v1/auth/check_token before rendering app data.
 */
export default function LoginTokenPage() {
  const params = useParams()
  const router = useRouter()
  const token = typeof params?.token === 'string' ? decodeURIComponent(params.token) : undefined

  useEffect(() => {
    if (!token) {
      router.replace('/')
      return
    }

    setEntryToken(token)
    router.replace('/dashboard')
  }, [token, router])

  return <Spinner />
}

'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Box from '@mui/material/Box'

import BlankLayout from 'src/@core/layouts/BlankLayout'
import Spinner from 'src/@core/components/spinner'
import { useAuth } from 'src/hooks/useAuth'
import { isTemplateLoginEnabled } from 'src/configs/auth'
import getHomeRoute from 'src/layouts/components/acl/getHomeRoute'
import { buildLoginTokenPath, hasAttemptedNibAuthSso, markNibAuthSsoAttempted } from 'src/lib/auth-entry'
import { getNibAuthCookieToken } from 'src/lib/auth-token'

/**
 * App entry: SSO token exchange (env / URL / cookie) then redirect to dashboard.
 * Manual token entry lives at `/login`.
 */
export default function RootEntryPage() {
  const auth = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (hasAttemptedNibAuthSso()) return

    const nibToken = getNibAuthCookieToken()
    if (!nibToken) return

    markNibAuthSsoAttempted()
    router.replace(buildLoginTokenPath(nibToken))
  }, [router])

  useEffect(() => {
    if (auth.loading) return

    if (auth.user) {
      const returnUrl = searchParams.get('returnUrl')
      const destination =
        returnUrl && returnUrl !== '/' && returnUrl.startsWith('/')
          ? returnUrl
          : getHomeRoute(auth.user.role)
      router.replace(destination)

      return
    }

    router.replace(isTemplateLoginEnabled ? '/login/template' : '/login')
  }, [auth.loading, auth.user, router, searchParams])

  return (
    <BlankLayout>
      <Box className='content-center' sx={{ minHeight: '100vh' }}>
        <Spinner />
      </Box>
    </BlankLayout>
  )
}

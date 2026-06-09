'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Box from '@mui/material/Box'

import BlankLayout from 'src/@core/layouts/BlankLayout'
import Spinner from 'src/@core/components/spinner'
import { redirectToPanelLogin } from 'src/configs/auth-redirect'
import { useAuth } from 'src/hooks/useAuth'
import getHomeRoute from 'src/layouts/components/acl/getHomeRoute'
import { hasSessionAccessToken } from 'src/lib/auth-exchange'

/**
 * App entry: session → dashboard; otherwise redirect to panel SSO login.
 */
export default function RootEntryClient() {
  const auth = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

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

    if (hasSessionAccessToken()) {
      const returnUrl = searchParams.get('returnUrl')
      const destination =
        returnUrl && returnUrl !== '/' && returnUrl.startsWith('/')
          ? returnUrl
          : '/dashboard'
      router.replace(destination)

      return
    }

    redirectToPanelLogin()
  }, [auth.loading, auth.user, router, searchParams])

  return (
    <BlankLayout>
      <Box className='content-center' sx={{ minHeight: '100vh' }}>
        <Spinner />
      </Box>
    </BlankLayout>
  )
}

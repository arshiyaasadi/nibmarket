'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Link from 'next/link'

import BlankLayout from 'src/@core/layouts/BlankLayout'
import Spinner from 'src/@core/components/spinner'
import { useAuth } from 'src/hooks/useAuth'
import { isTemplateLoginEnabled } from 'src/configs/auth'
import getHomeRoute from 'src/layouts/components/acl/getHomeRoute'
import { buildLoginTokenPath, hasAttemptedNibAuthSso, markNibAuthSsoAttempted } from 'src/lib/auth-entry'
import { getNibAuthCookieToken, setEntryToken } from 'src/lib/auth-token'

/**
 * App entry: SSO token exchange (env / URL / cookie) then redirect to dashboard.
 * No Materialize email/password form on `/`.
 */
export default function RootEntryPage() {
  const auth = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [nibAuthRedirecting, setNibAuthRedirecting] = useState(false)

  useEffect(() => {
    if (hasAttemptedNibAuthSso()) return

    const nibToken = getNibAuthCookieToken()
    if (!nibToken) return

    markNibAuthSsoAttempted()
    setEntryToken(nibToken)
    setNibAuthRedirecting(true)
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
    }
  }, [auth.loading, auth.user, router, searchParams])

  if (nibAuthRedirecting || auth.loading || auth.user) {
    return (
      <BlankLayout>
        <Box className='content-center' sx={{ minHeight: '100vh' }}>
          <Spinner />
        </Box>
      </BlankLayout>
    )
  }

  if (isTemplateLoginEnabled) {
    router.replace('/login/template')

    return (
      <BlankLayout>
        <Box className='content-center' sx={{ minHeight: '100vh' }}>
          <Spinner />
        </Box>
      </BlankLayout>
    )
  }

  return (
    <BlankLayout>
      <Box
        className='content-center'
        sx={{
          minHeight: '100vh',
          flexDirection: 'column',
          gap: 2,
          px: 3,
          textAlign: 'center'
        }}
      >
        <Typography variant='h6' sx={{ fontWeight: 600 }}>
          ورود به سامانه انجام نشد
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ maxWidth: 420 }}>
          توکن SSO در دسترس نیست یا معتبر نیست. از لینک ورود با توکن استفاده کنید یا در محیط توسعه
          متغیر NEXT_PUBLIC_USER_TOKEN را تنظیم کنید.
        </Typography>
        <Button component={Link} href='/version' variant='outlined' size='small'>
          وضعیت نسخه
        </Button>
      </Box>
    </BlankLayout>
  )
}

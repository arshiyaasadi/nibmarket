'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import BlankLayout from 'src/@core/layouts/BlankLayout'
import Spinner from 'src/@core/components/spinner'
import { useAuth } from 'src/hooks/useAuth'
import { redirectToPanelLogin } from 'src/configs/auth-redirect'
import { formatApiErrorMessage } from 'src/lib/api-errors'
import { clearStaleSession } from 'src/lib/auth-exchange'
import { getNibAuthCookieToken, stripBearerPrefix } from 'src/lib/auth-token'
import getHomeRoute from 'src/layouts/components/acl/getHomeRoute'

type Props = {
  /** Token from server `cookies()` — covers HttpOnly nib_auth set by the panel. */
  serverNibAuthToken?: string | null
}

function resolveNibAuthToken(serverToken?: string | null): string | null {
  const fromServer = serverToken?.trim()
  if (fromServer) return stripBearerPrefix(fromServer)

  return getNibAuthCookieToken()
}

/**
 * App entry: if nib_auth exists and user has no session, exchange via check_token.
 */
export default function RootEntryClient({ serverNibAuthToken }: Props) {
  const auth = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const exchangeStarted = useRef(false)

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

    const nibToken = resolveNibAuthToken(serverNibAuthToken)
    if (!nibToken) {
      redirectToPanelLogin()

      return
    }

    if (exchangeStarted.current) return
    exchangeStarted.current = true

    clearStaleSession()

    void auth.loginWithToken({ token: nibToken }, err => {
      setError(formatApiErrorMessage(err))
    })
  }, [auth.loading, auth.user, auth, router, searchParams, serverNibAuthToken])

  if (error) {
    return (
      <BlankLayout>
        <Box
          className='content-center'
          sx={{ minHeight: '100vh', flexDirection: 'column', gap: 2, px: 3, textAlign: 'center' }}
        >
          <Typography variant='h6' sx={{ fontWeight: 600 }}>
            ورود خودکار انجام نشد
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ maxWidth: 420 }}>
            {error}
          </Typography>
          <Button
            variant='outlined'
            size='small'
            onClick={() => redirectToPanelLogin()}
          >
            ورود از پنل
          </Button>
        </Box>
      </BlankLayout>
    )
  }

  return (
    <BlankLayout>
      <Box className='content-center' sx={{ minHeight: '100vh' }}>
        <Spinner />
      </Box>
    </BlankLayout>
  )
}

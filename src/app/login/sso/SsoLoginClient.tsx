'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import BlankLayout from 'src/@core/layouts/BlankLayout'
import Spinner from 'src/@core/components/spinner'
import { redirectToPanelLogin } from 'src/configs/auth-redirect'
import { useAuth } from 'src/hooks/useAuth'
import getHomeRoute from 'src/layouts/components/acl/getHomeRoute'
import { formatApiErrorMessage } from 'src/lib/api-errors'
import { clearStaleSession } from 'src/lib/auth-exchange'
import { getNibAuthCookieToken, stripBearerPrefix } from 'src/lib/auth-token'

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
 * SSO callback: read nib_auth, exchange via check_token, redirect to role dashboard.
 */
export default function SsoLoginClient({ serverNibAuthToken }: Props) {
  const auth = useAuth()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [missingToken, setMissingToken] = useState(false)
  const exchangeStarted = useRef(false)

  useEffect(() => {
    if (auth.loading) return

    if (auth.user) {
      router.replace(getHomeRoute(auth.user.role))

      return
    }

    const nibToken = resolveNibAuthToken(serverNibAuthToken)
    if (!nibToken) {
      setMissingToken(true)

      return
    }

    if (exchangeStarted.current) return
    exchangeStarted.current = true

    clearStaleSession()

    void auth.loginWithToken({ token: nibToken }, err => {
      setError(formatApiErrorMessage(err))
    })
  }, [auth.loading, auth.user, auth, router, serverNibAuthToken])

  if (missingToken || error) {
    return (
      <BlankLayout>
        <Box
          className='content-center'
          sx={{ minHeight: '100vh', flexDirection: 'column', gap: 2, px: 3, textAlign: 'center' }}
        >
          <Typography variant='h6' sx={{ fontWeight: 600 }}>
            ورود انجام نشد
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ maxWidth: 420 }}>
            {error || 'توکن ورود در دسترس نیست. لطفاً دوباره از پنل وارد شوید.'}
          </Typography>
          <Button variant='contained' size='small' onClick={() => redirectToPanelLogin()}>
            ورود مجدد
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

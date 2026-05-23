'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Link from 'next/link'

import Spinner from 'src/@core/components/spinner'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import { useAuth } from 'src/hooks/useAuth'
import { exchangeEntryToken } from 'src/lib/auth-exchange'
import { setEntryToken } from 'src/lib/auth-token'
import getHomeRoute from 'src/layouts/components/acl/getHomeRoute'

/**
 * SSO entry: exchange foreign token via check_token, then redirect to dashboard.
 */
export default function LoginTokenPage() {
  const params = useParams()
  const router = useRouter()
  const auth = useAuth()
  const [error, setError] = useState<string | null>(null)

  const token =
    typeof params?.token === 'string' ? decodeURIComponent(params.token).trim() : ''

  useEffect(() => {
    if (!token) {
      router.replace('/')

      return
    }

    let cancelled = false

    const run = async () => {
      setError(null)
      auth.setLoading(true)
      setEntryToken(token)

      try {
        const user = await exchangeEntryToken(token)
        if (cancelled) return

        auth.setUser(user)
        router.replace(getHomeRoute(user.role))
      } catch {
        if (cancelled) return

        setError('تبادل توکن با سرور انجام نشد. توکن منقضی یا نامعتبر است.')
        auth.setUser(null)
      } finally {
        if (!cancelled) auth.setLoading(false)
      }
    }

    void run()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  if (error) {
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
            {error}
          </Typography>
          <Button component={Link} href='/' variant='outlined' size='small'>
            بازگشت
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

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
import { formatApiErrorMessage } from 'src/lib/api-errors'

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
      router.replace('/login/token')

      return
    }

    let cancelled = false

    const run = async () => {
      setError(null)

      await auth.loginWithToken({ token }, err => {
        if (cancelled) return

        setError(formatApiErrorMessage(err))
        auth.setUser(null)
      })
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
          <Button component={Link} href='/login/token' variant='outlined' size='small'>
            ورود دستی
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

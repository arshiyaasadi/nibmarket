'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import Spinner from 'src/@core/components/spinner'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import themeConfig from 'src/configs/themeConfig'
import { useAuth } from 'src/hooks/useAuth'
import { formatApiErrorMessage } from 'src/lib/api-errors'
import { extractTokenFromLoginPath } from 'src/lib/auth-entry'
import { stripBearerPrefix } from 'src/lib/auth-token'
import getHomeRoute from 'src/layouts/components/acl/getHomeRoute'

function tokenFromInput(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''

  const fromPath = extractTokenFromLoginPath(trimmed)
  if (fromPath) return fromPath

  try {
    const url = new URL(trimmed)
    const queryToken = url.searchParams.get('token')?.trim()
    if (queryToken) return stripBearerPrefix(queryToken)
  } catch {
    // Plain token input is the common path.
  }

  return stripBearerPrefix(trimmed)
}

export default function LoginPage() {
  const auth = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialToken = useMemo(() => searchParams.get('token') ?? '', [searchParams])
  const [token, setToken] = useState(initialToken)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (auth.loading || !auth.user) return

    const returnUrl = searchParams.get('returnUrl')
    const destination =
      returnUrl && returnUrl !== '/' && returnUrl.startsWith('/')
        ? returnUrl
        : getHomeRoute(auth.user.role)

    router.replace(destination)
  }, [auth.loading, auth.user, router, searchParams])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const entryToken = tokenFromInput(token)
    if (!entryToken) {
      setError('لطفا توکن ورود را وارد کنید.')

      return
    }

    setSubmitting(true)
    setError(null)

    await auth.loginWithToken({ token: entryToken }, err => {
      setError(formatApiErrorMessage(err))
    })

    setSubmitting(false)
  }

  if (auth.loading && !submitting) {
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
          p: 4,
          bgcolor: 'background.default'
        }}
      >
        <Card sx={{ width: '100%', maxWidth: 520, zIndex: 1 }}>
          <CardContent sx={{ p: theme => `${theme.spacing(10, 7, 7)} !important` }}>
            <Box sx={{ mb: 7, display: 'flex', justifyContent: 'center' }}>
              <Image
                src='/images/favicon.png'
                alt='Logo'
                width={157}
                height={43}
                style={{ objectFit: 'contain' }}
                priority
              />
            </Box>

            <Box sx={{ mb: 6, textAlign: 'center' }}>
              <Typography variant='h5' sx={{ mb: 1.5, fontWeight: 600 }}>
                ورود به {themeConfig.templateName}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                توکن را وارد کنید تا اعتبارسنجی شود و سشن شما ساخته شود.
              </Typography>
            </Box>

            {error && (
              <Box
                role='alert'
                sx={{
                  mb: 4,
                  p: 3,
                  borderRadius: 1,
                  color: '#E04440',
                  bgcolor: 'rgba(255, 77, 73, 0.12)'
                }}
              >
                <Typography variant='body2' sx={{ color: 'inherit' }}>
                  {error}
                </Typography>
              </Box>
            )}

            <form noValidate autoComplete='off' onSubmit={handleSubmit}>
              <TextField
                autoFocus
                fullWidth
                multiline
                minRows={3}
                maxRows={6}
                id='login-token'
                label='توکن ورود'
                value={token}
                onChange={event => setToken(event.target.value)}
                placeholder='توکن خام، Bearer token، یا لینک /login/token/...'
                sx={{ mb: 4 }}
              />

              <Button
                fullWidth
                size='large'
                type='submit'
                variant='contained'
                disabled={submitting || auth.loading}
              >
                {submitting || auth.loading ? 'در حال بررسی توکن...' : 'ورود'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Box>
    </BlankLayout>
  )
}

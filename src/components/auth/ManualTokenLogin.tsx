'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import Spinner from 'src/@core/components/spinner'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import themeConfig from 'src/configs/themeConfig'
import { PANEL_LOGIN_URL } from 'src/configs/auth-redirect'
import { useAuth } from 'src/hooks/useAuth'
import { parseLoginTokenInput } from 'src/lib/auth-entry'
import { formatApiErrorMessage } from 'src/lib/api-errors'
import getHomeRoute from 'src/layouts/components/acl/getHomeRoute'

type ManualTokenLoginProps = {
  /** Shown on /login/token — explains SSO bypass. */
  showSsoBypassHint?: boolean
}

export default function ManualTokenLogin({ showSsoBypassHint = false }: ManualTokenLoginProps) {
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

    const entryToken = parseLoginTokenInput(token)
    if (!entryToken) {
      setError('لطفاً توکن ورود را وارد کنید.')

      return
    }

    setSubmitting(true)
    setError(null)

    await auth.loginWithToken({ token: entryToken }, err => {
      setError(formatApiErrorMessage(err))
    })

    setSubmitting(false)
  }

  if (auth.loading && !submitting && !auth.user) {
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
                {showSsoBypassHint
                  ? 'اگر ورود خودکار از پنل کار نکرد، توکن nib_auth را از DevTools کپی کنید و اینجا بگذارید.'
                  : 'توکن را وارد کنید تا اعتبارسنجی شود و سشن شما ساخته شود.'}
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
                label='توکن ورود (nib_auth)'
                value={token}
                onChange={event => setToken(event.target.value)}
                placeholder='مقدار کوکی nib_auth از panel.nibdev.com یا لینک /login/token/...'
                sx={{ mb: 4 }}
              />

              <Button
                fullWidth
                size='large'
                type='submit'
                variant='contained'
                disabled={submitting || auth.loading}
                sx={{ mb: 2 }}
              >
                {submitting || auth.loading ? 'در حال بررسی توکن...' : 'ورود'}
              </Button>

              <Button fullWidth size='small' variant='text' component='a' href={PANEL_LOGIN_URL}>
                ورود از پنل نیب
              </Button>
            </form>

            {showSsoBypassHint && (
              <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 4, textAlign: 'center' }}>
                کوکی‌های پنل روی دامنهٔ panel.nibdev.com هستند و ممکن است به club.nibdev.com ارسال نشوند؛ در این حالت
                ورود دستی لازم است.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </BlankLayout>
  )
}

'use client'

import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import OutlinedInput from '@mui/material/OutlinedInput'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import Icon from 'src/@core/components/icon'
import Spinner from 'src/@core/components/spinner'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import themeConfig from 'src/configs/themeConfig'
import { normalizeUserRole } from 'src/configs/acl'
import { useAuth } from 'src/hooks/useAuth'
import getHomeRoute from 'src/layouts/components/acl/getHomeRoute'

type FormState = {
  email: string
  password: string
  showPassword: boolean
}

export default function AdminLoginPage() {
  const auth = useAuth()
  const router = useRouter()
  const [values, setValues] = useState<FormState>({
    email: 'admin@materialize.com',
    password: 'admin',
    showPassword: false
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (auth.loading || !auth.user) return

    const role = normalizeUserRole(auth.user.role)
    if (role !== 'admin') {
      auth.logout()
      setError('فقط کاربران ادمین از این مسیر می‌توانند وارد شوند.')

      return
    }

    router.replace(getHomeRoute(auth.user.role))
  }, [auth.loading, auth.user, auth, router])

  const handleChange = (prop: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [prop]: event.target.value })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    auth.login(
      {
        email: values.email.trim(),
        password: values.password,
        rememberMe: true,
        adminOnly: true
      },
      () => {
        setSubmitting(false)
        setError('ایمیل یا رمز عبور اشتباه است، یا حساب کاربری ادمین نیست.')
      }
    )
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
                ورود ادمین — {themeConfig.templateName}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                فقط دسترسی ادمین از این مسیر فعال است.
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
                id='admin-email'
                label='ایمیل'
                type='email'
                value={values.email}
                onChange={handleChange('email')}
                sx={{ mb: 4 }}
              />

              <FormControl fullWidth sx={{ mb: 4 }}>
                <InputLabel htmlFor='admin-password'>رمز عبور</InputLabel>
                <OutlinedInput
                  label='رمز عبور'
                  value={values.password}
                  id='admin-password'
                  onChange={handleChange('password')}
                  type={values.showPassword ? 'text' : 'password'}
                  endAdornment={
                    <InputAdornment position='end'>
                      <IconButton
                        edge='end'
                        onClick={() => setValues({ ...values, showPassword: !values.showPassword })}
                        onMouseDown={e => e.preventDefault()}
                        aria-label='نمایش رمز عبور'
                      >
                        <Icon icon={values.showPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'} />
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </FormControl>

              <Button fullWidth size='large' type='submit' variant='contained' disabled={submitting || auth.loading}>
                {submitting || auth.loading ? 'در حال ورود...' : 'ورود ادمین'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Box>
    </BlankLayout>
  )
}

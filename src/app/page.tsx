'use client'

// ** React Imports
import { ChangeEvent, useState, FormEvent } from 'react'

// ** Next Import
import Link from 'next/link'
import Image from 'next/image'

// ** MUI Components
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import InputLabel from '@mui/material/InputLabel'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import OutlinedInput from '@mui/material/OutlinedInput'
import { styled, useTheme } from '@mui/material/styles'
import MuiCard, { CardProps } from '@mui/material/Card'
import InputAdornment from '@mui/material/InputAdornment'
import MuiFormControlLabel, { FormControlLabelProps } from '@mui/material/FormControlLabel'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Configs
import themeConfig from 'src/configs/themeConfig'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Demo Imports
import FooterIllustrationsV1 from 'src/views/pages/auth/FooterIllustrationsV1'

// ** Hooks
import { useAuth } from 'src/hooks/useAuth'
import { useTranslation } from 'react-i18next'

interface State {
  email: string
  password: string
  showPassword: boolean
  rememberMe: boolean
}

// ** Styled Components
const Card = styled(MuiCard)<CardProps>(({ theme }) => ({
  [theme.breakpoints.up('sm')]: { width: 450 }
}))

const FormControlLabel = styled(MuiFormControlLabel)<FormControlLabelProps>(({ theme }) => ({
  '& .MuiFormControlLabel-label': {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary
  }
}))

export default function LoginPage() {
  // ** State
  const [values, setValues] = useState<State>({
    email: 'admin@materialize.com',
    password: 'admin',
    showPassword: false,
    rememberMe: false
  })

  // ** Hooks
  const theme = useTheme()
  const auth = useAuth()
  const { t } = useTranslation()

  const handleChange = (prop: keyof State) => (event: ChangeEvent<HTMLInputElement>) => {
    if (prop === 'rememberMe') {
      setValues({ ...values, [prop]: event.target.checked })
    } else {
      setValues({ ...values, [prop]: event.target.value })
    }
  }

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword })
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    auth.login(
      {
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe
      },
      () => {
        // Error callback - you can add error state and display here
        console.error('Login failed')
      }
    )
  }

  return (
    <BlankLayout>
      <Box className='content-center'>
        <Card sx={{ zIndex: 1 }}>
          <CardContent sx={{ p: theme => `${theme.spacing(13, 7, 6.5)} !important` }}>
            <Box sx={{ mb: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Image
                src='/images/favicon.png'
                alt='Logo'
                width={157}
                height={43}
                style={{ objectFit: 'contain' }}
                priority
              />
              
            </Box>
            <Box sx={{ mb: 6 }}>
              <Typography variant='h5' sx={{ mb: 1.5, fontWeight: 600, letterSpacing: '0.18px' }}>
                {`${t('Welcome to')} ${themeConfig.templateName}! 👋🏻`}
              </Typography>
              <Typography variant='body2'>{t('Please sign-in to your account and start the adventure')}</Typography>
            </Box>
            <form noValidate autoComplete='off' onSubmit={handleSubmit}>
              <TextField
                autoFocus
                fullWidth
                id='email'
                label={t('Email')}
                type='email'
                value={values.email}
                onChange={handleChange('email')}
                placeholder='admin@materialize.com'
                sx={{ mb: 4 }}
              />
              <FormControl fullWidth>
                <InputLabel htmlFor='auth-login-password'>{t('Password')}</InputLabel>
                <OutlinedInput
                  label={t('Password')}
                  value={values.password}
                  id='auth-login-password'
                  onChange={handleChange('password')}
                  type={values.showPassword ? 'text' : 'password'}
                  endAdornment={
                    <InputAdornment position='end'>
                      <IconButton
                        edge='end'
                        onClick={handleClickShowPassword}
                        onMouseDown={e => e.preventDefault()}
                        aria-label={t('toggle password visibility')}
                      >
                        <Icon icon={values.showPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'} />
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </FormControl>
              <Box
                sx={{ mb: 4, display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}
              >
                <FormControlLabel
                  label={t('Remember Me')}
                  control={
                    <Checkbox checked={values.rememberMe} onChange={handleChange('rememberMe')} />
                  }
                  sx={{ '& .MuiFormControlLabel-label': { color: 'text.primary' } }}
                />
                <Typography
                  variant='body2'
                  component={Link}
                  href='/pages/auth/forgot-password-v1'
                  sx={{ color: 'primary.main', textDecoration: 'none' }}
                >
                  {t('Forgot Password?')}
                </Typography>
              </Box>
              <Button fullWidth size='large' type='submit' variant='contained' sx={{ mb: 7 }}>
                {t('Login')}
              </Button>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Typography sx={{ mr: 2, color: 'text.secondary' }}>{t('New on our platform?')}</Typography>
                <Typography
                  component={Link}
                  href='/pages/auth/register-v1'
                  sx={{ color: 'primary.main', textDecoration: 'none' }}
                >
                  {t('Create an account')}
                </Typography>
              </Box>
           
            </form>
          </CardContent>
        </Card>
        <FooterIllustrationsV1 />
      </Box>
    </BlankLayout>
  )
}


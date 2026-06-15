'use client'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import Icon from 'src/@core/components/icon'
import { PANEL_LOGIN_URL } from 'src/configs/auth-redirect'
import { PANEL_BASE_URL } from 'src/configs/sso'

const LoggedOutPage = () => {
  const handleLoginAgain = () => {
    window.location.href = PANEL_LOGIN_URL
  }

  const handleGoToNibMarket = () => {
    window.location.href = PANEL_BASE_URL
  }

  return (
    <BlankLayout>
      <Box className='content-center'>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            p: 8,
            maxWidth: 400,
            width: '100%',
            textAlign: 'center'
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme => theme.palette.action.selected
            }}
          >
            <Icon icon='mdi:logout-variant' fontSize={36} />
          </Box>

          <Box>
            <Typography variant='h5' sx={{ fontWeight: 700, mb: 1 }}>
              از حساب خارج شدید
            </Typography>
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              با موفقیت از سامانه خارج شدید.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
            <Button
              fullWidth
              variant='contained'
              size='large'
              startIcon={<Icon icon='mdi:login-variant' />}
              onClick={handleLoginAgain}
            >
              ورود مجدد
            </Button>
            <Button
              fullWidth
              variant='outlined'
              size='large'
              startIcon={<Icon icon='mdi:store-outline' />}
              onClick={handleGoToNibMarket}
            >
              ورود به نیب مارکت
            </Button>
          </Box>
        </Box>
      </Box>
    </BlankLayout>
  )
}

export default LoggedOutPage

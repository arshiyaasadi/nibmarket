'use client'

// ** React Imports
import { Suspense, useState, useEffect, MouseEvent } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Menu from '@mui/material/Menu'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CardContent from '@mui/material/CardContent'
import InputLabel from '@mui/material/InputLabel'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputAdornment from '@mui/material/InputAdornment'
import { styled } from '@mui/material/styles'
import { IconButtonProps } from '@mui/material/IconButton'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Hooks
import useClipboard from 'src/@core/hooks/useClipboard'
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Config Import
import themeConfig from 'src/configs/themeConfig'

// ** Mock data
const invitedUsers = [
  { id: 1, name: 'علی احمدی', date: '2 روز پیش', avatar: '/images/avatars/1.png' },
  { id: 2, name: 'سارا محمدی', date: '5 روز پیش', avatar: '/images/avatars/2.png' },
  { id: 3, name: 'رضا کریمی', date: '1 هفته پیش', avatar: '/images/avatars/3.png' },
  { id: 4, name: 'زهرا رضایی', date: '2 هفته پیش', avatar: '/images/avatars/4.png' }
]

const referralCode = 'INVITE2024'

// ** Styled Components
const FacebookBtn = styled(IconButton)<IconButtonProps>(({ theme }) => ({
  color: theme.palette.common.white,
  backgroundColor: '#3B5998 !important',
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0, 1)
}))

const TwitterBtn = styled(IconButton)<IconButtonProps>(({ theme }) => ({
  color: theme.palette.common.white,
  backgroundColor: '#55ACEE !important',
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0, 1)
}))

const TelegramBtn = styled(IconButton)<IconButtonProps>(({ theme }) => ({
  color: theme.palette.common.white,
  backgroundColor: '#0088cc !important',
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0, 1)
}))

const WhatsAppBtn = styled(IconButton)<IconButtonProps>(({ theme }) => ({
  color: theme.palette.common.white,
  backgroundColor: '#25D366 !important',
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0, 1)
}))

const InviteFriendsPageContent = () => {
  // ** States
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [referralLink, setReferralLink] = useState('')

  // ** Hooks
  const { settings } = useSettings()
  const clipboard = useClipboard({
    onSuccess: () => {
      // You can replace this with a toast notification
      alert('کد دعوت با موفقیت کپی شد!')
    }
  })

  const linkClipboard = useClipboard({
    onSuccess: () => {
      alert('لینک دعوت با موفقیت کپی شد!')
    }
  })

  // ** Set referral link on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setReferralLink(`${window.location.origin}?ref=${referralCode}`)
    }
  }, [])

  // ** Handlers
  const handleShareClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleShareClose = () => {
    setAnchorEl(null)
  }

  const handleCopyCode = () => {
    clipboard.copy(referralCode)
  }

  const handleCopyLink = () => {
    if (referralLink) {
      linkClipboard.copy(referralLink)
    }
  }

  const handleShare = (platform: string) => {
    const shareText = `کد دعوت من: ${referralCode}\nبا استفاده از این کد دعوت، به ${themeConfig.templateName} بپیوندید!`
    const shareUrl = referralLink || `${typeof window !== 'undefined' ? window.location.origin : ''}?ref=${referralCode}`

    let url = ''
    switch (platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`
        break
      case 'telegram':
        url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
        break
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
        break
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        break
      default:
        return
    }

    if (typeof window !== 'undefined') {
      window.open(url, '_blank')
    }
    handleShareClose()
  }

  const open = Boolean(anchorEl)

  return (
    <Box>
      <Grid container spacing={6}>
        {/* Referral Code & Link */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 6 }}>
              <Typography variant='h6' sx={{ mb: 4, fontWeight: 600 }}>
                کد دعوت شما
              </Typography>
              <Box sx={{ mb: 4 }}>
                <InputLabel
                  htmlFor='referral-code'
                  sx={{
                    mb: 2,
                    fontSize: '0.875rem',
                    color: 'text.secondary'
                  }}
                >
                  کد دعوت خود را کپی کنید و برای دوستانتان ارسال کنید
                </InputLabel>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <OutlinedInput
                    fullWidth
                    readOnly
                    id='referral-code'
                    value={referralCode}
                    size='medium'
                    sx={{
                      '& .MuiOutlinedInput-input': {
                        textAlign: 'center',
                        fontWeight: 600,
                        letterSpacing: '0.2em',
                        fontSize: '1.125rem'
                      }
                    }}
                    endAdornment={
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onClick={handleCopyCode}
                          aria-label='کپی کد دعوت'
                          sx={{ mr: -1 }}
                        >
                          <Icon icon='mdi:content-copy' fontSize={20} />
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 4 }} />

              <Box>
                <Typography variant='h6' sx={{ mb: 2, fontWeight: 600 }}>
                  لینک دعوت
                </Typography>
                <InputLabel
                  htmlFor='referral-link'
                  sx={{
                    mb: 2,
                    fontSize: '0.875rem',
                    color: 'text.secondary'
                  }}
                >
                  لینک دعوت خود را به اشتراک بگذارید
                </InputLabel>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                  <OutlinedInput
                    fullWidth
                    readOnly
                    id='referral-link'
                    value={referralLink}
                    size='medium'
                    sx={{
                      '& .MuiOutlinedInput-input': {
                        fontSize: '0.875rem'
                      }
                    }}
                    endAdornment={
                      <InputAdornment position='end'>
                        <Button size='small' onClick={handleCopyLink} sx={{ mr: -1 }}>
                          کپی لینک
                        </Button>
                      </InputAdornment>
                    }
                  />
                </Box>
              </Box>

              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
                <WhatsAppBtn onClick={() => handleShare('whatsapp')} aria-label='اشتراک در واتساپ'>
                  <Icon icon='mdi:whatsapp' fontSize={20} />
                </WhatsAppBtn>
                <TelegramBtn onClick={() => handleShare('telegram')} aria-label='اشتراک در تلگرام'>
                  <Icon icon='mdi:telegram' fontSize={20} />
                </TelegramBtn>
                <TwitterBtn onClick={() => handleShare('twitter')} aria-label='اشتراک در توییتر'>
                  <Icon icon='mdi:twitter' fontSize={20} />
                </TwitterBtn>
                <FacebookBtn onClick={() => handleShare('facebook')} aria-label='اشتراک در فیسبوک'>
                  <Icon icon='mdi:facebook' fontSize={20} />
                </FacebookBtn>
                <IconButton
                  onClick={handleShareClick}
                  sx={{
                    border: theme => `1px solid ${theme.palette.divider}`,
                    '&:hover': {
                      backgroundColor: theme => `rgba(${theme.palette.customColors.main}, 0.04)`
                    }
                  }}
                  aria-label='اشتراک بیشتر'
                >
                  <Icon icon='mdi:share-variant' fontSize={20} />
                </IconButton>
              </Box>

              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleShareClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: settings.direction === 'rtl' ? 'left' : 'right'
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: settings.direction === 'rtl' ? 'left' : 'right'
                }}
              >
                <MenuItem onClick={() => handleShare('whatsapp')} sx={{ '& svg': { mr: 2 } }}>
                  <Icon icon='mdi:whatsapp' fontSize={20} />
                  واتساپ
                </MenuItem>
                <MenuItem onClick={() => handleShare('telegram')} sx={{ '& svg': { mr: 2 } }}>
                  <Icon icon='mdi:telegram' fontSize={20} />
                  تلگرام
                </MenuItem>
                <MenuItem onClick={() => handleShare('twitter')} sx={{ '& svg': { mr: 2 } }}>
                  <Icon icon='mdi:twitter' fontSize={20} />
                  توییتر
                </MenuItem>
                <MenuItem onClick={() => handleShare('facebook')} sx={{ '& svg': { mr: 2 } }}>
                  <Icon icon='mdi:facebook' fontSize={20} />
                  فیسبوک
                </MenuItem>
              </Menu>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Invited Friends */}
        <Grid item xs={12} md={6}>
      <Card>
            <CardContent sx={{ p: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                <Typography variant='h6' sx={{ fontWeight: 600 }}>
                  دعوت شدگان اخیر
                </Typography>
                <Typography
                  component={Link}
                  href='/network/my-subsets'
                  variant='body2'
                  sx={{
                    color: 'primary.main',
                    cursor: 'pointer',
                    fontWeight: 500,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  نمایش همه
                </Typography>
              </Box>

              <Grid container spacing={3}>
                {invitedUsers.map(user => (
                  <Grid item xs={12} sm={6} key={user.id}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 3,
                        border: theme => `1px solid ${theme.palette.divider}`,
                        borderRadius: 1
                      }}
                    >
                      <Avatar
                        src={user.avatar}
                        sx={{
                          width: 48,
                          height: 48,
                          mr: 2,
                          backgroundColor: 'primary.main',
                          color: 'primary.contrastText',
                          fontSize: '0.875rem',
                          fontWeight: 600
                        }}
                      >
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant='body2' sx={{ fontWeight: 600, mb: 0.5 }}>
                          {user.name}
                        </Typography>
                        <Typography variant='caption' sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                          <Icon icon='mdi:clock-outline' fontSize={14} style={{ marginRight: 4 }} />
                          {user.date}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
        </CardContent>
      </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

const InviteFriendsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InviteFriendsPageContent />
    </Suspense>
  )
}

export default InviteFriendsPage


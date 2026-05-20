// ** React Imports
import { useState, MouseEvent } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Menu from '@mui/material/Menu'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CardContent from '@mui/material/CardContent'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputAdornment from '@mui/material/InputAdornment'
import { useTheme } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Hooks
import useClipboard from 'src/@core/hooks/useClipboard'
import { useSettings } from 'src/@core/hooks/useSettings'
import { useDashboardInvites } from 'src/hooks/dashboard/useDashboardInvites'
import DashboardWidgetState from 'src/components/dashboard/DashboardWidgetState'
import WidgetField from 'src/components/dashboard/WidgetField'

const CrmAward = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const theme = useTheme()
  const { settings } = useSettings()
  const { data, loading, retrying, error, hasData, usedFallback, refetch } = useDashboardInvites()
  const { totalInvited, referralCode, recentInvites } = data

  const clipboard = useClipboard({
    onSuccess: () => {
      alert('کد معرف کپی شد')
    }
  })

  const handleShareClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleShareClose = () => {
    setAnchorEl(null)
  }

  const handleCopy = () => {
    clipboard.copy(referralCode)
  }

  const handleShare = (platform: string) => {
    const shareText = `کد معرف من: ${referralCode}`
    const shareUrl = `${window.location.origin}?ref=${referralCode}`

    let url = ''
    switch (platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
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

    window.open(url, '_blank')
    handleShareClose()
  }

  const open = Boolean(anchorEl)

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <DashboardWidgetState
        loading={loading}
        retrying={retrying}
        error={error}
        usedFallback={usedFallback}
        onRetry={refetch}
        skeletonHeight={400}
        widgetTitle='دعوت شدگان'
      >
        <CardContent
          sx={{
            p: 6,
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Typography variant='h6' sx={{ fontWeight: 600, letterSpacing: '0.15px' }}>
              دعوت شدگان (
              <WidgetField ready={hasData} width={28} height={22}>
                <span>{totalInvited}</span>
              </WidgetField>
              )
            </Typography>
            <Typography
              variant='body2'
              sx={{
                color: 'primary.main',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.875rem',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              نمایش همه
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            {Array.from({ length: hasData ? recentInvites.length : 3 }).map((_, index) => {
              const row = hasData ? recentInvites[index] : { id: index, name: '', invitedAtLabel: '' }
              const rowCount = hasData ? recentInvites.length : 3

              return (
                <Box
                  key={hasData ? row.id : index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: index !== rowCount - 1 ? 3 : 0
                  }}
                >
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      mr: 2,
                      backgroundColor: 'rgba(76, 78, 100, 0.08)',
                      color: theme.palette.primary.main,
                      fontSize: '1.25rem'
                    }}
                  >
                    <Icon icon='mdi:account' fontSize='1.25rem' />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <WidgetField ready={hasData} width='70%' height={18}>
                      <Typography variant='body2' sx={{ fontWeight: 500, mb: 0.5, fontSize: '0.875rem' }}>
                        {row.name}
                      </Typography>
                    </WidgetField>
                    <WidgetField ready={hasData} width='40%' height={14}>
                      <Typography variant='caption' sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                        {row.invitedAtLabel}
                      </Typography>
                    </WidgetField>
                  </Box>
                </Box>
              )
            })}
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minHeight: 0
            }}
          >
            <Typography variant='body2' sx={{ fontWeight: 600, mb: 3, fontSize: '0.875rem' }}>
              کد معرف
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {hasData ? (
                <OutlinedInput
                  fullWidth
                  readOnly
                  value={referralCode}
                  size='small'
                  sx={{
                    '& .MuiOutlinedInput-input': {
                      textAlign: 'center',
                      fontWeight: 600,
                      letterSpacing: '0.1em'
                    }
                  }}
                  endAdornment={
                    <InputAdornment position='end'>
                      <IconButton edge='end' onClick={handleCopy} aria-label='کپی کد معرف' sx={{ mr: -1 }}>
                        <Icon icon='mdi:content-copy' fontSize={20} />
                      </IconButton>
                    </InputAdornment>
                  }
                />
              ) : (
                <WidgetField ready={false} width='100%' height={40} />
              )}
              <IconButton
                onClick={handleShareClick}
                sx={{
                  border: theme => `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    backgroundColor: theme => `rgba(${theme.palette.customColors.main}, 0.04)`
                  }
                }}
              >
                <Icon icon='mdi:share-variant' fontSize={20} />
              </IconButton>
            </Box>
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
      </DashboardWidgetState>
    </Card>
  )
}

export default CrmAward

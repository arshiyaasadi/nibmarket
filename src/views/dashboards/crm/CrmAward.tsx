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

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Hooks
import useClipboard from 'src/@core/hooks/useClipboard'
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Mock data for invited users
const invitedUsers = [
  { id: 1, name: 'علی احمدی', date: '2 روز پیش' },
  { id: 2, name: 'سارا محمدی', date: '5 روز پیش' },
  { id: 3, name: 'رضا کریمی', date: '1 هفته پیش' }
]

const totalInvited = 24 // Total number of invited users
const referralCode = 'INVITE2024' // Referral code

const CrmAward = () => {
  // ** States
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  // ** Hooks
  const { settings } = useSettings()
  const clipboard = useClipboard({
    onSuccess: () => {
      alert('کد دعوت کپی شد')
    }
  })

  // ** Handlers
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
    const shareText = `کد دعوت من: ${referralCode}`
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
    <Card>
      <CardContent>
        {/* Title with count and Show All button */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant='h6' sx={{ fontWeight: 600 }}>
            دعوت شدگان ({totalInvited})
          </Typography>
          <Typography
            variant='body2'
            sx={{
              color: 'primary.main',
              cursor: 'pointer',
              fontWeight: 500,
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            نمایش همه
          </Typography>
        </Box>

        {/* Recent invited users */}
        <Box sx={{ mb: 3 }}>
          {invitedUsers.map((user, index) => (
            <Box
              key={user.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: index !== invitedUsers.length - 1 ? 3 : 0
              }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  mr: 2,
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}
              >
                {user.name.split(' ').map(n => n[0]).join('')}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant='body2' sx={{ fontWeight: 500, mb: 0.5 }}>
                  {user.name}
                </Typography>
                <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                  {user.date}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Divider */}
        <Divider sx={{ my: 3 }} />

        {/* Referral Code Section */}
        <Box>
          <Typography variant='body2' sx={{ fontWeight: 600, mb: 2 }}>
            کد دعوت
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
                  <IconButton
                    edge='end'
                    onClick={handleCopy}
                    aria-label='کپی کد دعوت'
                    sx={{ mr: -1 }}
                  >
                    <Icon icon='mdi:content-copy' fontSize={20} />
                  </IconButton>
                </InputAdornment>
              }
            />
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

        {/* Share Menu */}
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
  )
}

export default CrmAward

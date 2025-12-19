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
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import CardContent from '@mui/material/CardContent'
import InputLabel from '@mui/material/InputLabel'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import { styled } from '@mui/material/styles'
import { IconButtonProps } from '@mui/material/IconButton'

// ** Third Party Imports
import toast from 'react-hot-toast'

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
const MAX_INVITES_PER_MONTH = 15

type InviteStep = 'form' | 'template' | 'preview' | 'success'

// Helper functions for monthly invite limit tracking
const getCurrentMonthKey = () => {
  const now = new Date()
  return `invite_limit_${now.getFullYear()}_${now.getMonth()}`
}

const getRemainingInvites = (): number => {
  if (typeof window === 'undefined') return MAX_INVITES_PER_MONTH
  const monthKey = getCurrentMonthKey()
  const saved = localStorage.getItem(monthKey)
  if (saved) {
    const parsed = parseInt(saved, 10)
    return Math.max(0, parsed)
  }
  return MAX_INVITES_PER_MONTH
}

const decrementRemainingInvites = (): number => {
  if (typeof window === 'undefined') return MAX_INVITES_PER_MONTH - 1
  const monthKey = getCurrentMonthKey()
  const current = getRemainingInvites()
  const newCount = Math.max(0, current - 1)
  localStorage.setItem(monthKey, newCount.toString())
  return newCount
}

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
  const [inviteStep, setInviteStep] = useState<InviteStep>('form')
  const [inviteName, setInviteName] = useState('')
  const [inviteMobile, setInviteMobile] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [isSendingInvite, setIsSendingInvite] = useState(false)
  const [remainingInvites, setRemainingInvites] = useState<number>(MAX_INVITES_PER_MONTH)

  // Initialize remaining invites from localStorage
  useEffect(() => {
    setRemainingInvites(getRemainingInvites())
  }, [])

  const normalizeToEnglishDigits = (value: string) => {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']

    return value
      .split('')
      .map(char => {
        const persianIndex = persianDigits.indexOf(char)
        if (persianIndex > -1) return String(persianIndex)

        const arabicIndex = arabicDigits.indexOf(char)
        if (arabicIndex > -1) return String(arabicIndex)

        return char
      })
      .join('')
  }

  // ** Hooks
  const { settings } = useSettings()
  const clipboard = useClipboard({
    onSuccess: () => {
      // You can replace this with a toast notification
      alert('کد معرف با موفقیت کپی شد!')
    }
  })

  const linkClipboard = useClipboard({
    onSuccess: () => {
      alert('لینک دعوت با موفقیت کپی شد!')
    }
  })

  // ** Helper function to get base URL
  const getBaseUrl = (): string => {
    if (typeof window === 'undefined') return ''
    
    // First check environment variable
    const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_HOST_URL
    if (envUrl) {
      // Remove trailing slash if exists
      return envUrl.replace(/\/$/, '')
    }
    
    // Fallback to window.location.origin (auto-detect)
    return window.location.origin
  }

  // ** Set referral link on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const baseUrl = getBaseUrl()
      setReferralLink(`${baseUrl}/invite?code=${referralCode}`)
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
    const shareText = `کد معرف من: ${referralCode}\nبا استفاده از این کد معرف، به ${themeConfig.templateName} بپیوندید!`
    const shareUrl = referralLink || `${getBaseUrl()}/invite?code=${referralCode}`

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

  const inviteTemplates: string[] = [
    'سلام .......... . گفتم بهت بگم؛ با صندوق درآمد ثابت می‌تونی بدون دردسر نوسان بازار، سود ثابت بگیری. به نظرم گزینه خوبیه. از لینک زیر میتونی عضو بشی',
    'سلام .......... . اگه پولت یه گوشه خوابه، صندوق‌های درآمد ثابت انتخاب امنیه. سودش منظمه و خیالت راحته، ارزش بررسی داره. از لینک زیر میتونی عضو بشی',
    'سلام .......... . یه مدته صندوق گرفتم، سودش بد نیست و ریسکش کمه. از لینک زیر میتونی عضو بشی'
  ]

  const isFormValid = inviteName.trim().length > 0 && /^09\d{9}$/.test(inviteMobile.trim())
  const resolvedTemplateText =
    selectedTemplate?.replace('..........', inviteName.trim() || 'دوست عزیز') || ''

  const handleResetInviteFlow = () => {
    setInviteStep('form')
    setInviteName('')
    setInviteMobile('')
    setSelectedTemplate(null)
  }

  const handleSendInvite = async () => {
    if (!inviteMobile.trim() || !resolvedTemplateText.trim()) {
      toast.error('لطفاً شماره موبایل و متن دعوت را تکمیل کنید')
      return
    }

    // Check if user has remaining invites
    if (remainingInvites <= 0) {
      toast.error(`شما حداکثر ${MAX_INVITES_PER_MONTH} پیام در ماه می‌توانید ارسال کنید. لطفاً ماه آینده دوباره تلاش کنید.`)
      return
    }

    try {
      setIsSendingInvite(true)

      // TODO: Replace this mock implementation with a real API call
      // Example:
      // await axios.post('/api/network/invite', {
      //   mobile: inviteMobile,
      //   message: resolvedTemplateText,
      //   referralLink
      // })
      await new Promise(resolve => setTimeout(resolve, 800))

      // Decrement remaining invites on success
      const newCount = decrementRemainingInvites()
      setRemainingInvites(newCount)

      toast.success('دعوت‌نامه با موفقیت ارسال شد')
      setInviteStep('success')
    } catch (error) {
      toast.error('ارسال دعوت‌نامه با خطا مواجه شد، لطفاً دوباره تلاش کنید')
    } finally {
      setIsSendingInvite(false)
    }
  }

  return (
    <Box>
      <Grid container spacing={6}>
        {/* Invite Message Flow + Referral Code & Link */}
        <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Invite message card (moved above referral code) */}
          <Card>
            <CardContent sx={{ p: 6 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant='h6' sx={{ fontWeight: 600 }}>
                    ارسال پیام دعوت
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography
                      variant='body2'
                      sx={{
                        color: remainingInvites > 0 ? 'text.secondary' : 'error.main',
                        fontWeight: 500,
                        fontSize: '0.8125rem',
                        letterSpacing: '0.01em'
                      }}
                    >
                      {remainingInvites.toLocaleString('fa-IR')}/{MAX_INVITES_PER_MONTH.toLocaleString('fa-IR')}
                    </Typography>
                    <Tooltip
                      title='در هر ماه ۱۵ پیام قابل ارسال است و با شروع ماه جدید، تعداد پیام‌های باقیمانده به ۱۵ بازمی‌گردد'
                      arrow
                      placement='top'
                    >
                      <IconButton
                        size='small'
                        sx={{
                          p: 0,
                          color: 'text.secondary',
                          '&:hover': {
                            color: 'primary.main'
                          }
                        }}
                      >
                        <Icon icon='mdi:alert-circle-outline' fontSize='0.875rem' />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Step 1: Basic info form */}
                {inviteStep === 'form' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                      fullWidth
                      label='نام و نام خانوادگی'
                      value={inviteName}
                      onChange={e => setInviteName(e.target.value)}
                    />
                    <TextField
                      fullWidth
                      label='شماره موبایل'
                      value={inviteMobile}
                      onChange={e => {
                        const normalized = normalizeToEnglishDigits(e.target.value || '').replace(
                          /[^0-9]/g,
                          ''
                        )
                        setInviteMobile(normalized)
                      }}
                      placeholder='مثال: 09123456789'
                      inputProps={{ maxLength: 11 }}
                      helperText='شماره موبایل باید با 09 شروع شده و ۱۱ رقم باشد'
                    />
                    <Button
                      variant='contained'
                      fullWidth
                      disabled={!isFormValid}
                      onClick={() => setInviteStep('template')}
                    >
                      ادامه
                    </Button>
                  </Box>
                )}

                {/* Step 2: Choose template */}
                {inviteStep === 'template' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                      یکی از قالب‌های پیشنهادی پیام را انتخاب کنید:
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {inviteTemplates.map(template => (
                        <Box
                          key={template}
                          onClick={() => setSelectedTemplate(template)}
                          sx={theme => ({
                            p: 2.5,
                            borderRadius: 2,
                            border:
                              selectedTemplate === template
                                ? `2px solid ${theme.palette.primary.main}`
                                : `1px solid ${theme.palette.divider}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            backgroundColor:
                              selectedTemplate === template
                                ? theme.palette.action.hover
                                : theme.palette.background.paper
                          })}
                        >
                          <Typography variant='body2'>{template}</Typography>
                        </Box>
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                      <Button
                        variant='contained'
                        fullWidth
                        disabled={!selectedTemplate}
                        onClick={() => setInviteStep('preview')}
                      >
                        ادامه
                      </Button>
                      <Button
                        variant='outlined'
                        fullWidth
                        onClick={() => setInviteStep('form')}
                      >
                        بازگشت
                      </Button>
                    </Box>
                  </Box>
                )}

                {/* Step 3: Preview */}
                {inviteStep === 'preview' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                      پیش‌نمایش پیام دعوت:
                    </Typography>
                    <Box
                      sx={theme => ({
                        p: 3,
                        borderRadius: 2,
                        border: `1px dashed ${theme.palette.divider}`,
                        backgroundColor: theme.palette.action.hover
                      })}
                    >
                      <Typography variant='body2' sx={{ mb: 1 }}>
                        <strong>شماره گیرنده:</strong> {inviteMobile}
                      </Typography>
                      <Typography variant='body2' sx={{ whiteSpace: 'pre-line' }}>
                        {resolvedTemplateText}
                      </Typography>
                      {referralLink && (
                        <Typography
                          variant='caption'
                          sx={{ display: 'block', mt: 2, color: 'text.secondary' }}
                        >
                          لینک دعوت: {referralLink}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant='contained'
                        fullWidth
                        onClick={handleSendInvite}
                        disabled={isSendingInvite || remainingInvites <= 0}
                      >
                        {isSendingInvite ? 'در حال ارسال...' : remainingInvites <= 0 ? 'محدودیت ماهانه تمام شده' : 'ارسال دعوت‌نامه'}
                      </Button>
                      <Button
                        variant='outlined'
                        fullWidth
                        color='secondary'
                        onClick={() => setInviteStep('template')}
                      >
                        بازگشت
                      </Button>
                    </Box>
                  </Box>
                )}

                {/* Step 4: Success */}
                {inviteStep === 'success' && (
                  <Box
                    sx={theme => ({
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: 2.5,
                      p: 3,
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.success.light}`,
                      backgroundColor: theme.palette.success.light
                    })}
                  >
                    <Icon icon='mdi:check-circle-outline' fontSize={40} />
                    <Box>
                      <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 1 }}>
                        پیام با موفقیت ارسال شد
                      </Typography>
                      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                        می‌توانید یک دعوت جدید برای مخاطب دیگری ثبت کنید.
                      </Typography>
                    </Box>
                    <Button variant='contained' onClick={handleResetInviteFlow}>
                      دعوت جدید
                    </Button>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Referral code + link card (below invite card) */}
          <Card>
            <CardContent sx={{ p: 6 }}>
              <Typography variant='h6' sx={{ mb: 4, fontWeight: 600 }}>
                کد معرف شما
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
                  کد معرف خود را کپی کنید و برای دوستانتان ارسال کنید
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
                          aria-label='کپی کد معرف'
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
                <Typography
                  component={Link}
                  href={`/invite?code=${referralCode}`}
                  variant='h6'
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    color: 'primary.main',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    display: 'inline-block',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  مشاهده لینک دعوت
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
                        sx={{
                          width: 48,
                          height: 48,
                          mr: 2,
                          backgroundColor: 'primary.main',
                          color: 'primary.contrastText',
                          fontSize: '1.5rem'
                        }}
                      >
                        <Icon icon='mdi:account' fontSize='1.5rem' />
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


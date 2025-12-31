'use client'

// ** React Imports
import { Suspense, useState, useEffect, MouseEvent } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Step from '@mui/material/Step'
import Menu from '@mui/material/Menu'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Stepper from '@mui/material/Stepper'
import MenuItem from '@mui/material/MenuItem'
import StepLabel from '@mui/material/StepLabel'
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

// ** Styled Components
import StepperWrapper from 'src/@core/styles/mui/stepper'

// ** Config Import
import themeConfig from 'src/configs/themeConfig'

// ** Type Definitions
export interface FundData {
  id: string
  name: string
  symbol: string
  category: string
  investors: number
  capital: number
  percentage: number
}

// ** Fund List Data
const FUNDS: FundData[] = [
  {
    id: '1',
    name: 'نهال سرمایه ایرانیان',
    symbol: 'صنهال',
    category: 'درآمد ثابت | ETF',
    investors: 0,
    capital: 0,
    percentage: 0
  },
  {
    id: '2',
    name: 'فراز اندیش نوین',
    symbol: '',
    category: 'درآمد ثابت',
    investors: 0,
    capital: 0,
    percentage: 0
  },
  {
    id: '3',
    name: 'ثابت یکم ایرانیان',
    symbol: '',
    category: 'درآمد ثابت',
    investors: 0,
    capital: 0,
    percentage: 0
  },
  {
    id: '4',
    name: 'طلای گلدیس',
    symbol: '',
    category: 'طلا | ETF',
    investors: 0,
    capital: 0,
    percentage: 0
  },
  {
    id: '5',
    name: 'میعاد ایرانیان',
    symbol: '',
    category: 'سهامی',
    investors: 0,
    capital: 0,
    percentage: 0
  },
  {
    id: '6',
    name: 'سپهر اندیشه نوین',
    symbol: 'صنوین',
    category: 'مختلط | ETF',
    investors: 0,
    capital: 0,
    percentage: 0
  },
  {
    id: '7',
    name: 'ارمغان ایرانیان',
    symbol: 'ارمغان',
    category: 'درآمد ثابت | ETF',
    investors: 0,
    capital: 0,
    percentage: 0
  },
  {
    id: '8',
    name: 'نوین پیشرو',
    symbol: '',
    category: 'بازار گردانی اختصاصی',
    investors: 0,
    capital: 0,
    percentage: 0
  },
  {
    id: '9',
    name: 'پالایشی یکم',
    symbol: 'پالایش',
    category: 'سهامی | ETF',
    investors: 0,
    capital: 0,
    percentage: 0
  }
]

// ** Mock data
const invitedUsers = [
  { id: 1, name: 'علی احمدی', date: '2 روز پیش', avatar: '/images/avatars/1.png' },
  { id: 2, name: 'سارا محمدی', date: '5 روز پیش', avatar: '/images/avatars/2.png' },
  { id: 3, name: 'رضا کریمی', date: '1 هفته پیش', avatar: '/images/avatars/3.png' },
  { id: 4, name: 'زهرا رضایی', date: '2 هفته پیش', avatar: '/images/avatars/4.png' }
]

const referralCode = 'INVITE2024'
const MAX_INVITES_PER_MONTH = 15

// Wizard steps
const steps = [
  {
    title: 'انتخاب صندوق',
    subtitle: 'صندوق مورد نظر را انتخاب کنید'
  },
  {
    title: 'اطلاعات دعوت',
    subtitle: 'اطلاعات فرد را وارد کنید'
  },
  {
    title: 'پیش‌نمایش و ارسال',
    subtitle: 'بررسی و ارسال دعوت‌نامه'
  }
]

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
  const [activeStep, setActiveStep] = useState(0)
  const [selectedFund, setSelectedFund] = useState<FundData | null>(null)
  const [inviteName, setInviteName] = useState('')
  const [inviteMobile, setInviteMobile] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [isSendingInvite, setIsSendingInvite] = useState(false)
  const [remainingInvites, setRemainingInvites] = useState<number>(MAX_INVITES_PER_MONTH)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [referralLink, setReferralLink] = useState('')

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
      toast.success('کد معرف با موفقیت کپی شد!')
    }
  })

  const linkClipboard = useClipboard({
    onSuccess: () => {
      toast.success('لینک دعوت با موفقیت کپی شد!')
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

  // ** Set referral link on client side with fund ID
  useEffect(() => {
    if (typeof window !== 'undefined' && selectedFund) {
      const baseUrl = getBaseUrl()
      setReferralLink(`${baseUrl}/invite?code=${referralCode}&fund=${selectedFund.id}`)
    } else if (typeof window !== 'undefined') {
      const baseUrl = getBaseUrl()
      setReferralLink(`${baseUrl}/invite?code=${referralCode}`)
    }
  }, [selectedFund])

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
    const fundText = selectedFund ? ` برای صندوق ${selectedFund.name}` : ''
    const shareText = `کد معرف من: ${referralCode}\nبا استفاده از این کد معرف${fundText}، به ${themeConfig.templateName} بپیوندید!`
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

  // Generate invite templates with fund name
  const getInviteTemplates = (): string[] => {
    const fundName = selectedFund?.name || 'صندوق'
    return [
      `سلام .......... . گفتم بهت بگم؛ با صندوق ${fundName} می‌تونی بدون دردسر نوسان بازار، سود ثابت بگیری. به نظرم گزینه خوبیه. از لینک زیر میتونی عضو بشی`,
      `سلام .......... . اگه پولت یه گوشه خوابه، صندوق ${fundName} انتخاب امنیه. سودش منظمه و خیالت راحته، ارزش بررسی داره. از لینک زیر میتونی عضو بشی`,
      `سلام .......... . یه مدته صندوق ${fundName} گرفتم، سودش بد نیست و ریسکش کمه. از لینک زیر میتونی عضو بشی`
    ]
  }

  const inviteTemplates = getInviteTemplates()

  const isStep1Valid = selectedFund !== null
  const isStep2Valid = inviteName.trim().length > 0 || inviteMobile.trim().length === 11
  const isStep3Valid = selectedTemplate !== null
  
  const resolvedTemplateText =
    selectedTemplate?.replace('..........', inviteName.trim() || 'دوست عزیز') || ''

  const handleNext = () => {
    if (activeStep === 0 && !isStep1Valid) {
      toast.error('لطفاً یک صندوق انتخاب کنید')
      return
    }
    if (activeStep === 1 && !isStep2Valid) {
      toast.error('لطفاً نام یا شماره موبایل را وارد کنید')
      return
    }
    setActiveStep(prevActiveStep => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleReset = () => {
    setActiveStep(0)
    setSelectedFund(null)
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
      //   referralLink,
      //   fundId: selectedFund?.id
      // })
      await new Promise(resolve => setTimeout(resolve, 800))

      // Decrement remaining invites on success
      const newCount = decrementRemainingInvites()
      setRemainingInvites(newCount)

      toast.success('دعوت‌نامه با موفقیت ارسال شد')
      setActiveStep(3) // Move to success step
    } catch (error) {
      toast.error('ارسال دعوت‌نامه با خطا مواجه شد، لطفاً دوباره تلاش کنید')
    } finally {
      setIsSendingInvite(false)
    }
  }

  // Render step content
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        // Step 1: Fund Selection
        return (
          <Box>
            <Typography variant='body2' sx={{ mb: 3, color: 'text.secondary' }}>
              صندوق مورد نظر خود را برای معرفی به دوستانتان انتخاب کنید:
            </Typography>
            <Box sx={{ maxHeight: '600px', overflowY: 'auto', pr: 1 }}>
              <Grid container spacing={3}>
              {FUNDS.map(fund => (
                <Grid item xs={6} lg={4} key={fund.id}>
                  <Card
                    onClick={() => setSelectedFund(fund)}
                    elevation={0}
                    sx={theme => ({
                      cursor: 'pointer',
                      height: '110px',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.2s ease',
                      border: selectedFund?.id === fund.id 
                        ? `2px solid ${theme.palette.primary.main}` 
                        : `1px solid ${theme.palette.divider}`,
                      backgroundColor: selectedFund?.id === fund.id
                        ? theme.palette.action.selected
                        : theme.palette.background.paper,
                      '&:hover': {
                        borderColor: theme.palette.primary.light,
                        backgroundColor: theme.palette.action.hover
                      }
                    })}
                  >
                    <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant='subtitle2' sx={{ fontWeight: 600, fontSize: '0.8125rem', lineHeight: 1.3 }}>
                          {fund.name}
                        </Typography>
                        {selectedFund?.id === fund.id && (
                          <Icon icon='mdi:check-circle' fontSize={18} color='primary' />
                        )}
                      </Box>
                      <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {fund.symbol && (
                          <Typography variant='caption' sx={{ 
                            color: 'primary.main', 
                            fontWeight: 600,
                            fontSize: '0.7rem'
                          }}>
                            {fund.symbol}
                          </Typography>
                        )}
                        <Typography variant='caption' sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                          {fund.category}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
              <Button
                variant='contained'
                onClick={handleNext}
                disabled={!isStep1Valid}
                endIcon={<Icon icon='mdi:arrow-left' />}
              >
                ادامه
              </Button>
            </Box>
          </Box>
        )

      case 1:
        // Step 2: Invitation Details
        return (
          <Box>
            <Typography variant='body2' sx={{ mb: 3, color: 'text.secondary' }}>
              اطلاعات فرد مورد نظر برای دعوت را وارد کنید:
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='نام و نام خانوادگی'
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                  placeholder='مثال: علی احمدی'
                />
              </Grid>
              <Grid item xs={12}>
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
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ 
                  my: 3, 
                  borderWidth: '2px',
                  borderColor: theme => theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.35)' : 'rgba(255, 255, 255, 0.35)'
                }} />
                <Typography variant='body2' sx={{ mb: 3, color: 'text.secondary', fontWeight: 500 }}>
                  یا می‌توانید کد معرف و لینک دعوت خود را کپی کنید:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box>
                    <InputLabel sx={{ mb: 1.5, fontSize: '0.875rem', color: 'text.secondary' }}>
                      کد معرف
                    </InputLabel>
                    <OutlinedInput
                      fullWidth
                      readOnly
                      value={referralCode}
                      size='medium'
                      sx={{
                        '& .MuiOutlinedInput-input': {
                          textAlign: 'center',
                          fontWeight: 600,
                          letterSpacing: '0.2em'
                        }
                      }}
                      endAdornment={
                        <InputAdornment position='end'>
                          <Button size='small' onClick={handleCopyCode}>
                            کپی کد
                          </Button>
                        </InputAdornment>
                      }
                    />
                  </Box>
                  <Box>
                    <InputLabel sx={{ mb: 1.5, fontSize: '0.875rem', color: 'text.secondary' }}>
                      لینک دعوت {selectedFund && `(برای صندوق ${selectedFund.name})`}
                    </InputLabel>
                    <OutlinedInput
                      fullWidth
                      readOnly
                      value={referralLink}
                      size='medium'
                      sx={{
                        '& .MuiOutlinedInput-input': {
                          fontSize: '0.875rem'
                        }
                      }}
                      endAdornment={
                        <InputAdornment position='end'>
                          <Button size='small' onClick={handleCopyLink}>
                            کپی لینک
                          </Button>
                        </InputAdornment>
                      }
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                variant='outlined'
                onClick={handleBack}
                startIcon={<Icon icon='mdi:arrow-right' />}
              >
                بازگشت
              </Button>
              <Button
                variant='contained'
                onClick={handleNext}
                disabled={!isStep2Valid}
                endIcon={<Icon icon='mdi:arrow-left' />}
              >
                ادامه
              </Button>
            </Box>
          </Box>
        )

      case 2:
        // Step 3: Template Selection & Preview
        return (
          <Box>
            <Typography variant='body2' sx={{ mb: 3, color: 'text.secondary' }}>
              یکی از قالب‌های پیشنهادی پیام را انتخاب کنید:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
              {inviteTemplates.map((template, index) => {
                const displayTemplate = template.replace('..........', inviteName.trim() || '..........')
                return (
                  <Box
                    key={index}
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
                          : theme.palette.background.paper,
                      '&:hover': {
                        borderColor: theme.palette.primary.main
                      }
                    })}
                  >
                    <Typography variant='body2'>{displayTemplate}</Typography>
                  </Box>
                )
              })}
            </Box>

            {selectedTemplate && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant='body2' sx={{ mb: 2, color: 'text.secondary', fontWeight: 600 }}>
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
                    <strong>شماره گیرنده:</strong> {inviteMobile || 'وارد نشده'}
                  </Typography>
                  <Typography variant='body2' sx={{ mb: 1 }}>
                    <strong>صندوق:</strong> {selectedFund?.name}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant='body2' sx={{ whiteSpace: 'pre-line', mb: 2 }}>
                    {resolvedTemplateText}
                  </Typography>
                  {referralLink && (
                    <Typography
                      variant='caption'
                      sx={{ display: 'block', color: 'primary.main', wordBreak: 'break-all' }}
                    >
                      {referralLink}
                    </Typography>
                  )}
                </Box>
              </>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                variant='outlined'
                onClick={handleBack}
                startIcon={<Icon icon='mdi:arrow-right' />}
              >
                بازگشت
              </Button>
              <Button
                variant='contained'
                onClick={handleSendInvite}
                disabled={!isStep3Valid || isSendingInvite || remainingInvites <= 0 || !inviteMobile.trim()}
                endIcon={<Icon icon='mdi:send' />}
              >
                {isSendingInvite ? 'در حال ارسال...' : remainingInvites <= 0 ? 'محدودیت ماهانه تمام شده' : 'ارسال دعوت‌نامه'}
              </Button>
            </Box>
          </Box>
        )

      case 3:
        // Step 4: Success
        return (
          <Box
            sx={theme => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 2.5,
              p: 4,
              borderRadius: 2,
              border: `1px solid ${theme.palette.success.light}`,
              backgroundColor: theme.palette.mode === 'light' 
                ? 'rgba(114, 225, 40, 0.08)' 
                : 'rgba(114, 225, 40, 0.16)'
            })}
          >
            <Box
              sx={theme => ({
                width: 60,
                height: 60,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.palette.success.main,
                color: theme.palette.common.white
              })}
            >
              <Icon icon='mdi:check' fontSize={40} />
            </Box>
            <Box>
              <Typography variant='h6' sx={{ fontWeight: 600, mb: 1 }}>
                پیام با موفقیت ارسال شد
              </Typography>
              <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                دعوت‌نامه شما برای صندوق {selectedFund?.name} ارسال شد.
              </Typography>
              <Typography variant='body2' sx={{ color: 'text.secondary', mt: 1 }}>
                می‌توانید یک دعوت جدید برای مخاطب دیگری ثبت کنید.
              </Typography>
            </Box>
            <Button variant='contained' onClick={handleReset} startIcon={<Icon icon='mdi:plus' />}>
              دعوت جدید
            </Button>
          </Box>
        )

      default:
        return null
    }
  }

  return (
    <Box>
      <Grid container spacing={6}>
        {/* Wizard Card */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 6 }}>
              {/* Header with remaining invites */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                <Typography variant='h6' sx={{ fontWeight: 600 }}>
                  دعوت از دوستان
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

              {/* Stepper */}
              <StepperWrapper>
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                  {steps.map((step, index) => {
                    return (
                      <Step key={index}>
                        <StepLabel>
                          <div>
                            <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                              {step.title}
                            </Typography>
                            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                              {step.subtitle}
                            </Typography>
                          </div>
                        </StepLabel>
                      </Step>
                    )
                  })}
                </Stepper>
              </StepperWrapper>

              {/* Step Content */}
              <Box sx={{ mt: 4 }}>
                {renderStepContent(activeStep)}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Invited Friends */}
        <Grid item xs={12}>
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

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {invitedUsers.map(user => (
                  <Box
                    key={user.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 3,
                      border: theme => `1px solid ${theme.palette.divider}`,
                      borderRadius: 2
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
                        <Icon icon='mdi:clock-outline' fontSize={14} style={{ marginLeft: 4 }} />
                        {user.date}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* Share buttons */}
              <Divider sx={{ my: 4 }} />
              <Typography variant='body2' sx={{ mb: 3, color: 'text.secondary', textAlign: 'center' }}>
                اشتراک‌گذاری در شبکه‌های اجتماعی
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
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
              </Box>
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

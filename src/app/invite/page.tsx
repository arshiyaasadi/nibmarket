'use client'

// ** React Imports
import { useEffect, useState, Suspense } from 'react'

// ** Next Import
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'

// ** MUI Components
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { styled } from '@mui/material/styles'
import MuiCard, { CardProps } from '@mui/material/Card'

// ** Configs
import themeConfig from 'src/configs/themeConfig'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Demo Imports
import FooterIllustrationsV1 from 'src/views/pages/auth/FooterIllustrationsV1'

// ** Utils
import { getReferrerInfo, storeReferralCode, type ReferrerInfo } from 'src/utils/invite-utils'

// ** Component Import
import Spinner from 'src/@core/components/spinner'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Styled Components
const StyledCard = styled(MuiCard)<CardProps>(({ theme }) => ({
  [theme.breakpoints.up('sm')]: { width: 450 }
}))

const InvitePageContent = () => {
  // ** Hooks
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get('code')

  // ** States
  const [referrerInfo, setReferrerInfo] = useState<ReferrerInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ** Fetch referrer info
  useEffect(() => {
    const fetchReferrerInfo = async () => {
      if (!code) {
        setError('کد دعوت یافت نشد')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const info = await getReferrerInfo(code)
        
        if (info && info.isValid) {
          setReferrerInfo(info)
          // Store code in localStorage for registration/login
          storeReferralCode(code)
          setError(null)
        } else {
          setError('کد دعوت نامعتبر است')
          setReferrerInfo(null)
        }
      } catch (err) {
        setError('خطا در دریافت اطلاعات معرف')
        setReferrerInfo(null)
      } finally {
        setLoading(false)
      }
    }

    fetchReferrerInfo()
  }, [code])

  // ** Get initials for avatar fallback
  const getInitials = (name: string): string => {
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0]
    }
    return name.substring(0, 2).toUpperCase()
  }

  // ** Handle navigation with referral code
  const handleNavigateToRegister = () => {
    router.push(`/pages/auth/register-v1${code ? `?ref=${code}` : ''}`)
  }

  const handleNavigateToLogin = () => {
    router.push(`/${code ? `?ref=${code}` : ''}`)
  }

  if (loading) {
    return (
      <BlankLayout>
        <Box className='content-center'>
          <StyledCard sx={{ zIndex: 1 }}>
            <CardContent sx={{ p: theme => `${theme.spacing(13, 7, 6.5)} !important` }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, py: 8 }}>
                <Spinner />
                <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                  در حال دریافت اطلاعات...
                </Typography>
              </Box>
            </CardContent>
          </StyledCard>
        </Box>
      </BlankLayout>
    )
  }

  if (error || !referrerInfo) {
    return (
      <BlankLayout>
        <Box className='content-center'>
          <StyledCard sx={{ zIndex: 1 }}>
            <CardContent sx={{ p: theme => `${theme.spacing(13, 7, 6.5)} !important` }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, py: 8 }}>
                <Icon icon='mdi:alert-circle-outline' fontSize='4rem' style={{ color: 'var(--mui-palette-error-main)' }} />
                <Typography variant='h6' sx={{ fontWeight: 600, textAlign: 'center' }}>
                  {error || 'کد دعوت نامعتبر است'}
                </Typography>
                <Typography variant='body2' sx={{ color: 'text.secondary', textAlign: 'center' }}>
                  لطفاً از لینک دعوت معتبر استفاده کنید
                </Typography>
                <Button variant='contained' component={Link} href='/' sx={{ mt: 2 }}>
                  بازگشت به صفحه اصلی
                </Button>
              </Box>
            </CardContent>
          </StyledCard>
        </Box>
      </BlankLayout>
    )
  }

  return (
    <BlankLayout>
      <Box className='content-center'>
        <StyledCard sx={{ zIndex: 1 }}>
          <CardContent sx={{ p: theme => `${theme.spacing(13, 7, 6.5)} !important` }}>
            {/* Logo */}
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

            {/* Welcome Message */}
            <Box sx={{ mb: 6, textAlign: 'center' }}>
              <Typography variant='h5' sx={{ mb: 1.5, fontWeight: 600, letterSpacing: '0.18px' }}>
                به {themeConfig.templateName} خوش آمدید! 👋
              </Typography>
              <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                شما توسط یکی از اعضای ما دعوت شده‌اید
              </Typography>
            </Box>

            {/* Referrer Info */}
            <Box
              sx={{
                mb: 6,
                p: 3,
                borderRadius: 2,
                backgroundColor: 'action.hover',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Typography variant='body2' sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                معرف شما:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={referrerInfo.referrerAvatar}
                  alt={referrerInfo.referrerName}
                  sx={{ width: 56, height: 56, fontSize: '1.5rem' }}
                >
                  {!referrerInfo.referrerAvatar && getInitials(referrerInfo.referrerName)}
                </Avatar>
                <Typography variant='h6' sx={{ fontWeight: 600 }}>
                  {referrerInfo.referrerName}
                </Typography>
              </Box>
            </Box>

            {/* Benefits */}
            <Box sx={{ mb: 6 }}>
              <Typography variant='subtitle2' sx={{ mb: 3, fontWeight: 600, textAlign: 'center' }}>
                مزایای عضویت در {themeConfig.templateName}:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  'دسترسی به تمام امکانات پلتفرم',
                  'سود و پاداش برای هر دعوت موفق',
                  'پشتیبانی ۲۴ ساعته',
                  'امنیت بالا و حریم خصوصی'
                ].map((benefit, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Icon icon='mdi:check-circle' fontSize='1.25rem' style={{ color: 'var(--mui-palette-success-main)' }} />
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                      {benefit}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
              <Button
                fullWidth
                size='large'
                variant='contained'
                onClick={handleNavigateToRegister}
                disabled
              >
                ثبت‌نام
              </Button>
            </Box>

            {/* Already registered link */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Typography variant='body2' sx={{ color: 'text.secondary', mr: 1 }}>
                قبلاً ثبت‌نام کرده‌اید؟
              </Typography>
              <Typography
                component={Link}
                href={`/${code ? `?ref=${code}` : ''}`}
                sx={{ color: 'primary.main', textDecoration: 'none', fontWeight: 500 }}
              >
                وارد شوید
              </Typography>
            </Box>
          </CardContent>
        </StyledCard>
        <FooterIllustrationsV1 />
      </Box>
    </BlankLayout>
  )
}

const InvitePage = () => {
  return (
    <Suspense fallback={
      <BlankLayout>
        <Box className='content-center'>
          <StyledCard sx={{ zIndex: 1 }}>
            <CardContent sx={{ p: theme => `${theme.spacing(13, 7, 6.5)} !important` }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, py: 8 }}>
                <Spinner />
              </Box>
            </CardContent>
          </StyledCard>
        </Box>
      </BlankLayout>
    }>
      <InvitePageContent />
    </Suspense>
  )
}

export default InvitePage


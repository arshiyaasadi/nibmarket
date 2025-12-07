'use client'

// ** React Imports
import { Suspense, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import InputLabel from '@mui/material/InputLabel'
import OutlinedInput from '@mui/material/OutlinedInput'
import FormControl from '@mui/material/FormControl'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Components
import toast from 'react-hot-toast'

// ** Custom Components Imports
import CustomAvatar from 'src/@core/components/mui/avatar'

interface ReferrerInfo {
  firstName: string
  lastName: string
  usedDate: string
}

const MyReferrerPageContent = () => {
  // ** States
  const [referralCode, setReferralCode] = useState('')
  const [hasSubsets, setHasSubsets] = useState(false) // Mock state - replace with actual data
  const [referrerInfo, setReferrerInfo] = useState<ReferrerInfo | null>(null)

  // ** Handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (referralCode.trim()) {
      // Mock: Simulate API call and set referrer info
      // In real app, this would come from API response
      setReferrerInfo({
        firstName: 'محمد',
        lastName: 'رضایی',
        usedDate: '۱۴۰۳/۰۹/۱۵'
      })
      toast.success('کد دعوت با موفقیت ثبت شد')
    }
  }

  // Helper function to get initials
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`
  }

  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 4 }}>
        معرف من
      </Typography>
      
      <Grid container spacing={6}>
        {/* Referral Code Input / Referrer Info Section */}
        <Grid item xs={12} md={6}>
          <Card>
            {referrerInfo ? (
              <>
                <CardHeader
                  title='معرف من'
                  titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 600 } }}
                />
                <CardContent sx={{ p: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    {/* Avatar with initials */}
                    <CustomAvatar
                      skin='light'
                      color='primary'
                      sx={{
                        width: 80,
                        height: 80,
                        fontSize: '2rem',
                        fontWeight: 600
                      }}
                    >
                      {getInitials(referrerInfo.firstName, referrerInfo.lastName)}
                    </CustomAvatar>

                    {/* Name */}
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant='h6' sx={{ fontWeight: 600, mb: 0.5 }}>
                        {referrerInfo.firstName} {referrerInfo.lastName}
                      </Typography>
                      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                        معرف شما
                      </Typography>
                    </Box>

                    <Divider sx={{ width: '100%', my: 2 }} />

                    {/* Usage Date */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Icon icon='mdi:calendar-clock' fontSize={20} style={{ color: 'inherit' }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant='body2' sx={{ color: 'text.secondary', mb: 0.5 }}>
                          تاریخ استفاده از کد دعوت:
                        </Typography>
                        <Typography variant='body1' sx={{ fontWeight: 600 }}>
                          {referrerInfo.usedDate}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </>
            ) : (
              <>
                <CardHeader
                  title='وارد کردن کد دعوت'
                  titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 600 } }}
                />
                <CardContent sx={{ p: 6 }}>
                  <form onSubmit={handleSubmit}>
                    <FormControl fullWidth sx={{ mb: 4 }}>
                      <InputLabel htmlFor='referral-code-input'>کد دعوت</InputLabel>
                      <OutlinedInput
                        id='referral-code-input'
                        label='کد دعوت'
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                        placeholder='کد دعوت را وارد کنید'
                        disabled={hasSubsets}
                        sx={{
                          '& .MuiOutlinedInput-input': {
                            textAlign: 'center',
                            fontWeight: 600,
                            letterSpacing: '0.1em',
                            fontSize: '1rem'
                          }
                        }}
                        startAdornment={
                          <Icon icon='mdi:ticket-percent' fontSize={20} style={{ marginRight: 8, color: 'inherit' }} />
                        }
                      />
                    </FormControl>
                    <Button
                      type='submit'
                      fullWidth
                      variant='contained'
                      disabled={!referralCode.trim() || hasSubsets}
                      sx={{ py: 1.5 }}
                    >
                      ثبت کد دعوت
                    </Button>
                    {hasSubsets && (
                      <Typography variant='body2' sx={{ mt: 2, color: 'error.main', textAlign: 'center' }}>
                        شما قبلاً زیرمجموعه گرفته‌اید و نمی‌توانید از کد دعوت استفاده کنید
                      </Typography>
                    )}
                  </form>
                </CardContent>
              </>
            )}
          </Card>
        </Grid>

        {/* Rules Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title='قوانین استفاده از کد دعوت'
              titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 600 } }}
            />
            <CardContent sx={{ p: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: 'primary.light',
                      color: 'primary.main',
                      mt: 0.5
                    }}
                  >
                    <Icon icon='mdi:check-circle' fontSize={20} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='body1' sx={{ fontWeight: 600, mb: 0.5 }}>
                      استفاده از کد دعوت
                    </Typography>
                    <Typography variant='body2' sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                      اگر تا کنون کد دعوت شخصی رو استفاده نکرده اید می‌توانید استفاده کنید.
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: 'error.light',
                      color: 'error.main',
                      mt: 0.5
                    }}
                  >
                    <Icon icon='mdi:close-circle' fontSize={20} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='body1' sx={{ fontWeight: 600, mb: 0.5 }}>
                      محدودیت استفاده
                    </Typography>
                    <Typography variant='body2' sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                      اگر زیرمجموعه گرفته باشید دیگر نمی‌توانید از کد دعوت شخصی استفاده کنید.
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

const MyReferrerPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MyReferrerPageContent />
    </Suspense>
  )
}

export default MyReferrerPage


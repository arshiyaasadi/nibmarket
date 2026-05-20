'use client'

// ** React Imports
import { Suspense, useEffect, useState } from 'react'

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
import InputAdornment from '@mui/material/InputAdornment'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Components
import toast from 'react-hot-toast'

// ** Custom Components Imports
import CustomAvatar from 'src/@core/components/mui/avatar'
import DashboardWidgetState from 'src/components/dashboard/DashboardWidgetState'

// ** Hooks
import { useNetworkReferrer } from 'src/hooks/network/useNetworkReferrer'
import { useSubmitReferrerCode } from 'src/hooks/network/useNetworkMutations'
import type { NetworkReferrerInfo } from 'src/types/api/network'

const MyReferrerPageContent = () => {
  const [referralCode, setReferralCode] = useState('')
  const [submittedReferrer, setSubmittedReferrer] = useState<NetworkReferrerInfo | null>(null)

  const { data, loading, retrying, error, hasData, usedFallback, refetch } = useNetworkReferrer()
  const { submit, submitting, error: submitError, clearError } = useSubmitReferrerCode()

  const hasSubsets = data.hasSubsets
  const referrerInfo = submittedReferrer ?? data.referrer

  useEffect(() => {
    setSubmittedReferrer(null)
  }, [data.referrer])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!referralCode.trim()) return

    clearError()
    const result = await submit({ referralCode: referralCode.trim() })
    if (result) {
      setSubmittedReferrer(result)
      toast.success('کد معرف با موفقیت ثبت شد')
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    const firstInitial = firstName && firstName.length > 0 ? firstName[0] : ''
    const lastInitial = lastName && lastName.length > 0 ? lastName[0] : ''

    return `${firstInitial}${lastInitial}` || '?'
  }

  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 4 }}>
        معرف من
      </Typography>

      <Grid container spacing={6}>
        <Grid item xs={12} md={6}>
          <Card>
            <DashboardWidgetState
              loading={loading}
              retrying={retrying}
              error={error}
              usedFallback={usedFallback}
              onRetry={refetch}
              skeletonHeight={320}
              widgetTitle='معرف من'
            >
              {referrerInfo ? (
                <>
                  <CardHeader title='معرف من' titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 600 } }} />
                  <CardContent sx={{ p: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
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

                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant='h6' sx={{ fontWeight: 600, mb: 0.5 }}>
                          {referrerInfo.firstName} {referrerInfo.lastName}
                        </Typography>
                        <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                          معرف شما
                        </Typography>
                      </Box>

                      <Divider sx={{ width: '100%', my: 2 }} />

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Icon icon='mdi:calendar-clock' fontSize={20} style={{ color: 'inherit' }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant='body2' sx={{ color: 'text.secondary', mb: 0.5 }}>
                            تاریخ استفاده از کد معرف:
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
                    title='وارد کردن کد معرف'
                    titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 600 } }}
                  />
                  <CardContent sx={{ p: 6 }}>
                    <form onSubmit={handleSubmit}>
                      <FormControl fullWidth sx={{ mb: 4 }}>
                        <InputLabel htmlFor='referral-code-input'>کد معرف</InputLabel>
                        <OutlinedInput
                          id='referral-code-input'
                          label='کد معرف'
                          value={referralCode}
                          onChange={e => setReferralCode(e.target.value)}
                          placeholder='کد معرف را وارد کنید'
                          disabled={hasSubsets || !hasData}
                          sx={{
                            '& .MuiOutlinedInput-input': {
                              textAlign: 'center',
                              fontWeight: 600,
                              letterSpacing: '0.1em',
                              fontSize: '1rem'
                            }
                          }}
                          startAdornment={
                            <InputAdornment position='start'>
                              <Icon icon='mdi:ticket-percent' fontSize={20} />
                            </InputAdornment>
                          }
                        />
                      </FormControl>
                      {submitError ? (
                        <Typography variant='body2' sx={{ mb: 2, color: 'error.main', textAlign: 'center' }}>
                          {submitError}
                        </Typography>
                      ) : null}
                      <Button
                        type='submit'
                        fullWidth
                        variant='contained'
                        disabled={!referralCode.trim() || hasSubsets || submitting || !hasData}
                        sx={{ py: 1.5 }}
                      >
                        {submitting ? 'در حال ثبت...' : 'ثبت کد معرف'}
                      </Button>
                      {hasSubsets ? (
                        <Typography variant='body2' sx={{ mt: 2, color: 'error.main', textAlign: 'center' }}>
                          شما قبلاً زیرمجموعه گرفته‌اید و نمی‌توانید از کد معرف استفاده کنید
                        </Typography>
                      ) : null}
                    </form>
                  </CardContent>
                </>
              )}
            </DashboardWidgetState>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title='قوانین استفاده از کد معرف'
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
                      استفاده از کد معرف
                    </Typography>
                    <Typography variant='body2' sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                      اگر تا کنون کد معرف شخصی رو استفاده نکرده اید می‌توانید استفاده کنید.
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
                      درصورتی که دارای زیرمجموعه باشید امکان ثبت کد معرف مقدور نمی‌باشد.
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

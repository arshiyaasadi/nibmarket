'use client'

// ** React Imports
import { Suspense } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

// ** Styled Component Import
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'

const ManagerDashboardPageContent = () => {
  return (
    <ApexChartWrapper>
      <Box sx={{ mb: 6 }}>
        <Typography variant='h4' sx={{ mb: 2, fontWeight: 600 }}>
          داشبورد مدیر
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          به پنل مدیریت خوش آمدید
        </Typography>
      </Box>
      <Grid container spacing={6} className='match-height'>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 2 }}>
                آمار کاربران
              </Typography>
              <Typography variant='h3' color='primary.main'>
                0
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                تعداد کاربران فعال
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 2 }}>
                درآمد کل
              </Typography>
              <Typography variant='h3' color='success.main'>
                0 تومان
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                مجموع درآمد
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 2 }}>
                تراکنش‌ها
              </Typography>
              <Typography variant='h3' color='info.main'>
                0
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                تعداد تراکنش‌های امروز
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 2 }}>
                مدیریت سیستم
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                پنل مدیریت در حال توسعه است. امکانات بیشتری به زودی اضافه خواهد شد.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </ApexChartWrapper>
  )
}

const ManagerDashboardPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ManagerDashboardPageContent />
    </Suspense>
  )
}

export default ManagerDashboardPage


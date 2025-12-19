'use client'

// ** React Imports
import { Suspense, useEffect } from 'react'

// ** Next Imports
import { useRouter } from 'next/navigation'

// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Hooks
import { useAuth } from 'src/hooks/useAuth'

// ** Component Imports
import Spinner from 'src/@core/components/spinner'

// ** Styled Component Import
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'

// ** Demo Components Imports
import CrmAward from 'src/views/dashboards/crm/CrmAward'
import CrmRewards from 'src/views/dashboards/crm/CrmRewards'
import CrmTotalProfit from 'src/views/dashboards/crm/CrmTotalProfit'
import CrmProjectTimeline from 'src/views/dashboards/crm/CrmProjectTimeline'
import CrmMonthlyRewardsLine from 'src/views/dashboards/crm/CrmMonthlyRewardsLine'
import CrmDailyGrowthLine from 'src/views/dashboards/crm/CrmDailyGrowthLine'
import CrmMonthlyRewardsBar from 'src/views/dashboards/crm/CrmMonthlyRewardsBar'

const DashboardPageContent = () => {
  // ** Hooks
  const auth = useAuth()
  const router = useRouter()

  // ** Redirect manager to manager dashboard
  useEffect(() => {
    if (auth.user && auth.user.role === 'manager') {
      router.replace('/manager/dashboard')
    }
  }, [auth.user, router])

  // ** Show spinner if user is manager (redirecting)
  if (auth.user && auth.user.role === 'manager') {
    return <Spinner />
  }

  // ** Only show client dashboard for client role
  return (
    <ApexChartWrapper>
      <Grid container spacing={6} className='match-height'>
        <Grid item xs={12} md={8}>
          <CrmRewards />
        </Grid>
        <Grid item xs={12} sm={12} md={4}>
          <CrmTotalProfit />
        </Grid>
        <Grid item xs={12} md={4}>
          <CrmAward />
        </Grid>
       
        <Grid item xs={12} md={8}>
          <CrmProjectTimeline />
        </Grid>
        <Grid item xs={12} md={4}>
          <CrmMonthlyRewardsLine />
        </Grid>
        <Grid item xs={12} md={4}>
          <CrmDailyGrowthLine />
        </Grid>
        <Grid item xs={12} md={4}>
          <CrmMonthlyRewardsBar />
        </Grid>
      </Grid>
    </ApexChartWrapper>
  )
}

const DashboardPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardPageContent />
    </Suspense>
  )
}

export default DashboardPage


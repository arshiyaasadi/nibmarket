'use client'

// ** React Imports
import { Suspense } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

// ** Components
import DashboardWidgetState from 'src/components/dashboard/DashboardWidgetState'
import PoolBalance from 'src/views/dashboards/pool-board/PoolBalance'
import CurrentMonthLeaderboard from 'src/views/dashboards/pool-board/CurrentMonthLeaderboard'
import MySubsetsLeaderboard from 'src/views/dashboards/pool-board/MySubsetsLeaderboard'
import LastMonthLeaderboard from 'src/views/dashboards/pool-board/LastMonthLeaderboard'
import HonorsShowcase from 'src/views/dashboards/pool-board/HonorsShowcase'

// ** Hooks
import { useLeaderboardPoolBalance } from 'src/hooks/leaderboard/useLeaderboardPoolBalance'
import { useLeaderboardCurrentMonth } from 'src/hooks/leaderboard/useLeaderboardCurrentMonth'
import { useLeaderboardMySubsets } from 'src/hooks/leaderboard/useLeaderboardMySubsets'
import { useLeaderboardLastMonth } from 'src/hooks/leaderboard/useLeaderboardLastMonth'
import { useLeaderboardHonors } from 'src/hooks/leaderboard/useLeaderboardHonors'

const PoolBoardPageContent = () => {
  const poolBalance = useLeaderboardPoolBalance()
  const currentMonth = useLeaderboardCurrentMonth()
  const mySubsets = useLeaderboardMySubsets()
  const lastMonth = useLeaderboardLastMonth()
  const honors = useLeaderboardHonors()

  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 4 }}>
        استخر و بورد
      </Typography>
      <Grid container spacing={6} className='match-height'>
        <Grid item xs={12} md={6}>
          <DashboardWidgetState
            loading={poolBalance.loading}
            retrying={poolBalance.retrying}
            error={poolBalance.error}
            usedFallback={poolBalance.usedFallback}
            onRetry={poolBalance.refetch}
            skeletonHeight={320}
            widgetTitle='موجودی استخر'
          >
            <PoolBalance data={poolBalance.data} />
          </DashboardWidgetState>
        </Grid>
        <Grid item xs={12} md={6}>
          <DashboardWidgetState
            loading={currentMonth.loading}
            retrying={currentMonth.retrying}
            error={currentMonth.error}
            usedFallback={currentMonth.usedFallback}
            onRetry={currentMonth.refetch}
            skeletonHeight={320}
            widgetTitle='لیدر بورد ماه جاری'
          >
            <CurrentMonthLeaderboard entries={currentMonth.data.entries} />
          </DashboardWidgetState>
        </Grid>
        <Grid item xs={12} md={6}>
          <DashboardWidgetState
            loading={mySubsets.loading}
            retrying={mySubsets.retrying}
            error={mySubsets.error}
            usedFallback={mySubsets.usedFallback}
            onRetry={mySubsets.refetch}
            skeletonHeight={320}
            widgetTitle='لیدربورد زیرمجموعه‌های شما'
          >
            <MySubsetsLeaderboard entries={mySubsets.data.entries} />
          </DashboardWidgetState>
        </Grid>
        <Grid item xs={12} md={6}>
          <DashboardWidgetState
            loading={lastMonth.loading}
            retrying={lastMonth.retrying}
            error={lastMonth.error}
            usedFallback={lastMonth.usedFallback}
            onRetry={lastMonth.refetch}
            skeletonHeight={320}
            widgetTitle='لیدر بورد ماه قبل'
          >
            <LastMonthLeaderboard entries={lastMonth.data.entries} />
          </DashboardWidgetState>
        </Grid>
        <Grid item xs={12}>
          <DashboardWidgetState
            loading={honors.loading}
            retrying={honors.retrying}
            error={honors.error}
            usedFallback={honors.usedFallback}
            onRetry={honors.refetch}
            skeletonHeight={280}
            widgetTitle='ویترین افتخارات'
          >
            <HonorsShowcase honors={honors.data.honors} />
          </DashboardWidgetState>
        </Grid>
      </Grid>
    </Box>
  )
}

const PoolBoardPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PoolBoardPageContent />
    </Suspense>
  )
}

export default PoolBoardPage

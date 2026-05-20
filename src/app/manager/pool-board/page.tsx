'use client'

// ** React Imports
import { Suspense } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

// ** Demo Components Imports
import PoolBalance from 'src/views/dashboards/pool-board/PoolBalance'
import CurrentMonthLeaderboard from 'src/views/dashboards/pool-board/CurrentMonthLeaderboard'
import MySubsetsLeaderboard from 'src/views/dashboards/pool-board/MySubsetsLeaderboard'
import LastMonthLeaderboard from 'src/views/dashboards/pool-board/LastMonthLeaderboard'
import HonorsShowcase from 'src/views/dashboards/pool-board/HonorsShowcase'

// ** Mocks (manager pool-board — outside reports plan API slugs; static presentation)
import {
  mockLeaderboardCurrentMonth,
  mockLeaderboardHonors,
  mockLeaderboardLastMonth,
  mockLeaderboardMySubsets,
  mockLeaderboardPoolBalance
} from 'src/mocks/leaderboard'

const PoolBoardPageContent = () => {
  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 4 }}>
        استخر و بورد
      </Typography>
      <Grid container spacing={6} className='match-height'>
        <Grid item xs={12} md={6}>
          <PoolBalance data={mockLeaderboardPoolBalance} />
        </Grid>
        <Grid item xs={12} md={6}>
          <CurrentMonthLeaderboard entries={mockLeaderboardCurrentMonth.entries} />
        </Grid>
        <Grid item xs={12} md={6}>
          <MySubsetsLeaderboard entries={mockLeaderboardMySubsets.entries} />
        </Grid>
        <Grid item xs={12} md={6}>
          <LastMonthLeaderboard entries={mockLeaderboardLastMonth.entries} />
        </Grid>
        <Grid item xs={12}>
          <HonorsShowcase honors={mockLeaderboardHonors.honors} />
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

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

const PoolBoardPageContent = () => {
  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 4 }}>
        استخر و بورد
      </Typography>
      <Grid container spacing={6} className='match-height'>
        {/* Row 1: Pool Balance and Current Month Leaderboard */}
        <Grid item xs={12} md={6}>
          <PoolBalance />
        </Grid>
        <Grid item xs={12} md={6}>
          <CurrentMonthLeaderboard />
        </Grid>

        {/* Row 2: My Subsets Leaderboard and Last Month Leaderboard */}
        <Grid item xs={12} md={6}>
          <MySubsetsLeaderboard />
        </Grid>
        <Grid item xs={12} md={6}>
          <LastMonthLeaderboard />
        </Grid>

        {/* Row 3: Honors Showcase - Full Width */}
        <Grid item xs={12}>
          <HonorsShowcase />
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


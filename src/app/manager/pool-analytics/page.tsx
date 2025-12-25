'use client'

// ** React Imports
import { Suspense, useState } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

// ** Component Imports - Pool Analytics Components
import AdvancedFilters from 'src/views/dashboards/manager/pool-analytics/AdvancedFilters'
import PoolGrowthTrend from 'src/views/dashboards/manager/pool-analytics/PoolGrowthTrend'
import ParticipantAnalytics from 'src/views/dashboards/manager/pool-analytics/ParticipantAnalytics'
import PerformanceMetrics from 'src/views/dashboards/manager/pool-analytics/PerformanceMetrics'
import ComparisonReports from 'src/views/dashboards/manager/pool-analytics/ComparisonReports'
import ExportTools from 'src/views/dashboards/manager/pool-analytics/ExportTools'
import Spinner from 'src/@core/components/spinner'

// ** Types
import type { FilterOptions, PoolAnalyticsData } from 'src/types/manager/pool-analytics'

// ** Mock Data
import { mockPoolAnalyticsData } from 'src/@fake-db/manager/pool-analytics'

const PoolAnalyticsPageContent = () => {
  // ** State
  const [poolData, setPoolData] = useState<PoolAnalyticsData>(mockPoolAnalyticsData)
  const [activeFilters, setActiveFilters] = useState<FilterOptions | null>(null)

  // Handle filter application
  const handleApplyFilters = (filters: FilterOptions) => {
    setActiveFilters(filters)
    // In a real application, you would fetch filtered data here
    console.log('Applied filters:', filters)
  }

  // Handle filter reset
  const handleResetFilters = () => {
    setActiveFilters(null)
    // Reset to original data
    setPoolData(mockPoolAnalyticsData)
  }

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      {/* Page Header */}
      <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant='h4' sx={{ mb: 1, fontWeight: 600 }}>
            تحلیل استخر و لیدربورد
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            داشبورد تحلیلی و گزارش‌گیری پیشرفته برای مدیریت استخر و لیدربورد
          </Typography>
        </Box>
        <ExportTools data={poolData} />
      </Box>

      {/* Advanced Filters */}
      <AdvancedFilters 
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />

      {/* Pool & Leaderboard Analytics */}
      <Grid container spacing={6}>
        {/* Row 1: Pool Growth and Participant Analytics */}
        <Grid item xs={12} lg={6}>
          <PoolGrowthTrend data={poolData.poolTrend} />
        </Grid>
        <Grid item xs={12} lg={6}>
          <ParticipantAnalytics data={poolData.participantStats} />
        </Grid>

        {/* Row 2: Performance Metrics and Comparison Reports */}
        <Grid item xs={12} lg={6}>
          <PerformanceMetrics data={poolData.performanceMetrics} />
        </Grid>
        <Grid item xs={12} lg={6}>
          <ComparisonReports 
            monthlyData={poolData.monthlyComparison}
            quarterlyData={poolData.quarterlyComparison}
          />
        </Grid>
      </Grid>
    </Box>
  )
}

const PoolAnalyticsPage = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <PoolAnalyticsPageContent />
    </Suspense>
  )
}

export default PoolAnalyticsPage


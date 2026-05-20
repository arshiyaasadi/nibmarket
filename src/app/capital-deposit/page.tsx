'use client'

// ** React Imports
import { Suspense } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'

// ** Component Imports
import FundStatistics from 'src/views/dashboards/capital-deposit/FundStatistics'
import FundDistribution from 'src/views/dashboards/capital-deposit/FundDistribution'
import FundCapitalChart from 'src/views/dashboards/capital-deposit/FundCapitalChart'
import DashboardWidgetState from 'src/components/dashboard/DashboardWidgetState'

// ** Hooks
import { useReportsCapitalDeposit } from 'src/hooks/reports/useReportsCapitalDeposit'

const CapitalDepositPageContent = () => {
  const { data, loading, retrying, error, hasData, usedFallback, refetch } = useReportsCapitalDeposit()
  const { funds, statistics } = data

  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 4 }}>
        رسوب سرمایه
      </Typography>

      <DashboardWidgetState
        loading={loading}
        retrying={retrying}
        error={error}
        usedFallback={usedFallback}
        onRetry={refetch}
        skeletonHeight={720}
        widgetTitle='رسوب سرمایه'
      >
        <Box sx={{ opacity: hasData ? 1 : 0.5 }}>
          <Box sx={{ mb: 6 }}>
            <FundStatistics
              totalInvestors={statistics.totalInvestors}
              totalCapital={statistics.totalCapital}
              firstInvestorsCapital={statistics.firstInvestorsCapital}
              networkCapital={statistics.networkCapital}
            />
          </Box>

          <Grid container spacing={6}>
            <Grid item xs={12}>
              <FundDistribution funds={funds} totalInvestors={statistics.totalInvestors} />
            </Grid>
            <Grid item xs={12}>
              <FundCapitalChart funds={funds} />
            </Grid>
          </Grid>
        </Box>
      </DashboardWidgetState>
    </Box>
  )
}

const CapitalDepositPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CapitalDepositPageContent />
    </Suspense>
  )
}

export default CapitalDepositPage

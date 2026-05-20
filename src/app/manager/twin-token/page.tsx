'use client'

// ** React Imports
import { Suspense } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

// ** Component Imports
import TwinTokenStatistics from 'src/views/dashboards/manager/twin-token/TwinTokenStatistics'
import TokenPriceChart from 'src/views/dashboards/manager/twin-token/TokenPriceChart'
import DashboardWidgetState from 'src/components/dashboard/DashboardWidgetState'

// ** Hooks
import { useTwinTokenStats } from 'src/hooks/manager/useTwinTokenStats'
import { useTwinTokenPriceChart } from 'src/hooks/manager/useTwinTokenPriceChart'

const TwinTokenPageContent = () => {
  const stats = useTwinTokenStats()
  const chart = useTwinTokenPriceChart()

  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 4 }}>
        توکن TWIN
      </Typography>

      <Box sx={{ mb: 6 }}>
        <DashboardWidgetState
          loading={stats.loading}
          retrying={stats.retrying}
          error={stats.error}
          usedFallback={stats.usedFallback}
          onRetry={stats.refetch}
          skeletonHeight={200}
          widgetTitle='آمار توکن TWIN'
        >
          <TwinTokenStatistics
            poolBalance={stats.data.poolBalance}
            totalTokens={stats.data.totalTokens}
            circulatingTokens={stats.data.circulatingTokens}
            tokenPrice={stats.data.tokenPrice}
            priceChange24h={stats.data.priceChange24h}
            burnedTokens={stats.data.burnedTokens}
          />
        </DashboardWidgetState>
      </Box>

      <Box>
        <DashboardWidgetState
          loading={chart.loading}
          retrying={chart.retrying}
          error={chart.error}
          usedFallback={chart.usedFallback}
          onRetry={chart.refetch}
          skeletonHeight={400}
          widgetTitle='نمودار قیمت'
        >
          <TokenPriceChart
            currentPrice={chart.data.currentPrice}
            priceChange24h={chart.data.priceChange24h}
            candles={chart.data.candles}
          />
        </DashboardWidgetState>
      </Box>
    </Box>
  )
}

const TwinTokenPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TwinTokenPageContent />
    </Suspense>
  )
}

export default TwinTokenPage

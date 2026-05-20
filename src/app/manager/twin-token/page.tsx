'use client'

// ** React Imports
import { Suspense, useState, useMemo } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

// ** Component Imports
import TwinTokenStatistics from 'src/views/dashboards/manager/twin-token/TwinTokenStatistics'
import TokenPriceChart from 'src/views/dashboards/manager/twin-token/TokenPriceChart'

// ** Mock Data Generator
const generateMockTwinTokenData = () => {
  // Mock data - in real app, this would come from API
  const totalTokens = 1000000000 // 1 billion tokens
  const burnedTokens = 50000000 // 50 million burned
  const circulatingTokens = totalTokens - burnedTokens // 950 million
  const poolBalance = 45000000000 // 45 billion Rial
  const tokenPrice = 47.37 // Rial per token
  const priceChange24h = 2.45 // 2.45% increase

  return {
    poolBalance,
    totalTokens,
    circulatingTokens,
    tokenPrice,
    priceChange24h,
    burnedTokens
  }
}

const TwinTokenPageContent = () => {
  // ** Mock data - in real app, this would come from API
  const [tokenData] = useState(() => generateMockTwinTokenData())

  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 4 }}>
        توکن TWIN
      </Typography>

      {/* Statistics */}
      <Box sx={{ mb: 6 }}>
        <TwinTokenStatistics
          poolBalance={tokenData.poolBalance}
          totalTokens={tokenData.totalTokens}
          circulatingTokens={tokenData.circulatingTokens}
          tokenPrice={tokenData.tokenPrice}
          priceChange24h={tokenData.priceChange24h}
          burnedTokens={tokenData.burnedTokens}
        />
      </Box>

      {/* Price Chart */}
      <Box>
        <TokenPriceChart
          currentPrice={tokenData.tokenPrice}
          priceChange24h={tokenData.priceChange24h}
        />
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

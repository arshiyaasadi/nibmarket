'use client'

// ** React Imports
import { Suspense, useState, useMemo } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'

// ** Component Imports
import FundStatistics from 'src/views/dashboards/capital-deposit/FundStatistics'
import FundDistribution, { FundData } from 'src/views/dashboards/capital-deposit/FundDistribution'
import FundCapitalChart from 'src/views/dashboards/capital-deposit/FundCapitalChart'

// ** Fund List based on image
const FUNDS: FundData[] = [
  {
    id: '1',
    name: 'نهال سرمایه ایرانیان',
    symbol: 'صنهال',
    category: 'درآمد ثابت | ETF',
    investors: 0,
    capital: 0,
    percentage: 0
  },
  {
    id: '2',
    name: 'فراز اندیش نوین',
    symbol: '',
    category: 'درآمد ثابت',
    investors: 0,
    capital: 0,
    percentage: 0
  },
  {
    id: '3',
    name: 'ثابت یکم ایرانیان',
    symbol: '',
    category: 'درآمد ثابت',
    investors: 0,
    capital: 0,
    percentage: 0
  },
  {
    id: '4',
    name: 'طلای گلدیس',
    symbol: '',
    category: 'طلا | ETF',
    investors: 0,
    capital: 0,
    percentage: 0
  },
  {
    id: '5',
    name: 'میعاد ایرانیان',
    symbol: '',
    category: 'سهامی',
    investors: 0,
    capital: 0,
    percentage: 0
  },
  {
    id: '6',
    name: 'سپهر اندیشه نوین',
    symbol: 'صنوین',
    category: 'مختلط | ETF',
    investors: 0,
    capital: 0,
    percentage: 0
  },
  {
    id: '7',
    name: 'ارمغان ایرانیان',
    symbol: 'ارمغان',
    category: 'درآمد ثابت | ETF',
    investors: 0,
    capital: 0,
    percentage: 0
  },
  {
    id: '8',
    name: 'نوین پیشرو',
    symbol: '',
    category: 'بازار گردانی اختصاصی',
    investors: 0,
    capital: 0,
    percentage: 0
  },
  {
    id: '9',
    name: 'پالایشی یکم',
    symbol: 'پالایش',
    category: 'سهامی | ETF',
    investors: 0,
    capital: 0,
    percentage: 0
  }
]

// ** Mock Data Generator
const generateMockFundData = (): FundData[] => {
  const totalInvestors = 1250
  const totalCapital = 45000000000 // 45 billion Toman

  // Generate random distribution
  const funds = FUNDS.map(fund => {
    const investors = Math.floor(Math.random() * 300) + 50
    const capital = Math.floor(Math.random() * 8000000000) + 1000000000
    return {
      ...fund,
      investors,
      capital
    }
  })

  // Normalize to match total
  const totalGeneratedInvestors = funds.reduce((sum, f) => sum + f.investors, 0)
  const totalGeneratedCapital = funds.reduce((sum, f) => sum + f.capital, 0)

  return funds.map(fund => {
    const investors = Math.floor((fund.investors / totalGeneratedInvestors) * totalInvestors)
    const capital = Math.floor((fund.capital / totalGeneratedCapital) * totalCapital)
    const percentage = (investors / totalInvestors) * 100

    return {
      ...fund,
      investors,
      capital,
      percentage
    }
  })
}

const CapitalDepositPageContent = () => {
  // ** Mock data - in real app, this would come from API
  const [funds] = useState<FundData[]>(() => generateMockFundData())

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalInvestors = funds.reduce((sum, fund) => sum + fund.investors, 0)
    const totalCapital = funds.reduce((sum, fund) => sum + fund.capital, 0)
    
    // First investors capital (assume 30% of total)
    const firstInvestorsCapital = Math.floor(totalCapital * 0.3)
    
    // Network capital (assume 70% of total)
    const networkCapital = totalCapital - firstInvestorsCapital

    return {
      totalInvestors,
      totalCapital,
      firstInvestorsCapital,
      networkCapital
    }
  }, [funds])

  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 4 }}>
        رسوب سرمایه
      </Typography>

      {/* Statistics */}
      <Box sx={{ mb: 6 }}>
        <FundStatistics
          totalInvestors={statistics.totalInvestors}
          totalCapital={statistics.totalCapital}
          firstInvestorsCapital={statistics.firstInvestorsCapital}
          networkCapital={statistics.networkCapital}
        />
      </Box>

      <Grid container spacing={6}>
        {/* Fund Distribution */}
        <Grid item xs={12}>
          <FundDistribution funds={funds} totalInvestors={statistics.totalInvestors} />
        </Grid>

        {/* Fund Capital Chart */}
        <Grid item xs={12}>
          <FundCapitalChart funds={funds} />
        </Grid>
      </Grid>
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

'use client'

// ** React Imports
import { useMemo } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import { useTheme } from '@mui/material/styles'

// ** Third Party Imports
import { ApexOptions } from 'apexcharts'

// ** Custom Components
import ReactApexcharts from 'src/@core/components/react-apexcharts'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

interface UserStatsCardProps {
  totalUsers: number
  growthPercentage: number
  currentCount: number
  previousCount: number
}

const UserStatsCard = ({ totalUsers, growthPercentage, currentCount, previousCount }: UserStatsCardProps) => {
  const theme = useTheme()

  // Generate 30 days of data
  const chartData = useMemo(() => {
    const days = 30
    const data = []
    const increment = (currentCount - previousCount) / days

    for (let i = 0; i < days; i++) {
      const value = Math.round(previousCount + increment * i)
      data.push(value)
    }

    return data
  }, [currentCount, previousCount])

  const options: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false },
      sparkline: { enabled: true }
    },
    colors: [theme.palette.primary.main],
    stroke: {
      width: 2.5,
      curve: 'smooth'
    },
    tooltip: {
      enabled: true,
      theme: theme.palette.mode,
      x: { show: false },
      y: {
        formatter: (value: number) => `${value.toLocaleString('fa-IR')} کاربر`
      }
    },
    grid: {
      show: false,
      padding: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }
    }
  }

  const series = [
    {
      name: 'کاربران',
      data: chartData
    }
  ]

  const isPositiveGrowth = growthPercentage >= 0

  return (
    <Card>
      <CardHeader
        title='آمار کاربران'
        titleTypographyProps={{
          variant: 'h6',
          sx: { letterSpacing: '0.15px', fontWeight: 600 }
        }}
      />
      <CardContent>
        <Grid container spacing={4}>
          {/* Left side - Stats */}
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Total Users */}
              <Box>
                <Typography variant='h4' sx={{ mb: 1, fontWeight: 600 }}>
                  {totalUsers.toLocaleString('fa-IR')}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  تعداد کل کاربران
                </Typography>
              </Box>

              {/* Growth Badge */}
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  bgcolor: isPositiveGrowth ? 'success.main' : 'error.main',
                  color: 'common.white',
                  width: 'fit-content',
                  border: 'none'
                }}
              >
                <Icon
                  icon={isPositiveGrowth ? 'mdi:trending-up' : 'mdi:trending-down'}
                  fontSize={20}
                />
                <Typography variant='body2' sx={{ fontWeight: 600 }}>
                  {isPositiveGrowth ? '+' : ''}
                  {growthPercentage.toFixed(1)}%
                </Typography>
              </Box>

              <Typography variant='caption' color='text.secondary'>
                رشد نسبت به ماه قبل
              </Typography>
            </Box>
          </Grid>

          {/* Right side - Chart */}
          <Grid item xs={12} sm={6}>
            <Box sx={{ height: 140 }}>
              <ReactApexcharts type='area' height={140} options={options} series={series} />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default UserStatsCard


'use client'

// ** React Imports
import { useMemo } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import { useTheme } from '@mui/material/styles'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// ** Third Party Imports
import { ApexOptions } from 'apexcharts'

// ** Custom Components Imports
import ReactApexcharts from 'src/@core/components/react-apexcharts'

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

interface UserGrowthChartProps {
  currentCount: number
  previousCount: number
}

const UserGrowthChart = ({ currentCount, previousCount }: UserGrowthChartProps) => {
  const theme = useTheme()

  // Generate trend data - normalized to show direction rather than exact values
  // This creates a smooth upward or downward trend based on growth
  const trendData = useMemo(() => {
    const days = 30
    const growthRate = currentCount > previousCount 
      ? ((currentCount - previousCount) / previousCount) * 100 
      : ((previousCount - currentCount) / previousCount) * -100
    
    const isPositive = growthRate > 0
    
    // Generate normalized trend values (0-100 scale) showing direction
    const data: number[] = []
    for (let i = 0; i < days; i++) {
      // Create smooth curve that trends upward or downward
      const progress = i / (days - 1)
      const baseValue = 40 // Starting point
      const trendAmount = isPositive ? 60 : -20 // Positive trends up, negative trends down
      const variation = Math.sin(progress * Math.PI * 2) * 5 // Add smooth variation
      const value = baseValue + (trendAmount * progress) + variation
      data.push(Math.max(10, Math.min(100, value))) // Keep within 10-100 range
    }
    
    return data
  }, [currentCount, previousCount])

  const options: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    colors: [
      currentCount > previousCount 
        ? hexToRGBA(theme.palette.success.main, 1) 
        : hexToRGBA(theme.palette.error.main, 1)
    ],
    stroke: { 
      curve: 'smooth',
      width: 3
    },
    dataLabels: { enabled: false },
    markers: {
      size: 0, // Hide markers for cleaner look
      hover: { size: 4 }
    },
    grid: {
      strokeDashArray: 6,
      borderColor: theme.palette.divider,
      xaxis: {
        lines: { show: false }
      },
      yaxis: {
        lines: { show: true }
      },
      padding: {
        top: -10,
        left: -7,
        right: 7,
        bottom: -10
      }
    },
    tooltip: {
      enabled: false // Disable tooltip to focus on trend direction
    },
    xaxis: {
      labels: {
        show: false // Hide x-axis labels to focus on trend
      },
      axisTicks: { show: false },
      axisBorder: { show: false },
      categories: Array.from({ length: 30 }, (_, i) => (i + 1).toString())
    },
    yaxis: {
      show: false, // Hide y-axis completely - we only care about direction
      labels: {
        show: false
      }
    }
  }

  const series = [{
    name: 'رشد کاربران',
    data: trendData
  }]

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title='چارت کاربران'
        titleTypographyProps={{ variant: 'h6', sx: { letterSpacing: '0.15px', fontWeight: 600, fontSize: '1rem' } }}
        sx={{ pb: 1, pt: 2.5, px: 2.5 }}
      />
      <CardContent sx={{ p: 2.5, pt: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <ReactApexcharts type='line' height={120} options={options} series={series} />
      </CardContent>
    </Card>
  )
}

export default UserGrowthChart


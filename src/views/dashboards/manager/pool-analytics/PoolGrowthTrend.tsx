'use client'

// ** React Imports
import { useMemo } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

// ** Third Party Imports
import { ApexOptions } from 'apexcharts'

// ** Custom Components Imports
import ReactApexcharts from 'src/@core/components/react-apexcharts'

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

// ** Types
import type { PoolDataPoint } from 'src/types/manager/pool-analytics'

interface PoolGrowthTrendProps {
  data: PoolDataPoint[]
}

const PoolGrowthTrend = ({ data }: PoolGrowthTrendProps) => {
  const theme = useTheme()

  // ** Prepare chart data
  const chartData = useMemo(() => {
    const dates = data.map(item => {
      const date = new Date(item.date)
      return `${date.getDate()}/${date.getMonth() + 1}`
    })
    
    const balances = data.map(item => item.balance)
    const participants = data.map(item => item.participants)
    
    return { dates, balances, participants }
  }, [data])

  // ** Calculate statistics
  const stats = useMemo(() => {
    if (data.length === 0) return { totalGrowth: 0, avgChange: 0 }
    
    const firstBalance = data[0].balance
    const lastBalance = data[data.length - 1].balance
    const totalGrowth = ((lastBalance - firstBalance) / firstBalance) * 100
    
    const avgChange = data.reduce((sum, item) => sum + item.change, 0) / data.length
    
    return { totalGrowth, avgChange }
  }, [data])

  const options: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    colors: [hexToRGBA(theme.palette.primary.main, 1), hexToRGBA(theme.palette.success.main, 1)],
    stroke: {
      curve: 'smooth',
      width: [3, 3]
    },
    dataLabels: { enabled: false },
    markers: {
      size: 0,
      hover: { size: 5 }
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      labels: {
        colors: theme.palette.text.secondary
      },
      fontFamily: theme.typography.fontFamily,
      fontSize: '13px'
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
        left: 10,
        right: 10,
        bottom: 0
      }
    },
    tooltip: {
      theme: theme.palette.mode,
      x: {
        show: true
      },
      y: {
        formatter: (value: number, opts: any) => {
          if (opts.seriesIndex === 0) {
            return `${value.toLocaleString('fa-IR')} TWIN`
          } else {
            return `${value.toLocaleString('fa-IR')} نفر`
          }
        }
      }
    },
    xaxis: {
      categories: chartData.dates,
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontFamily: theme.typography.fontFamily,
          fontSize: '12px'
        }
      },
      axisTicks: { show: false },
      axisBorder: { show: false }
    },
    yaxis: [
      {
        title: {
          text: 'موجودی استخر (TWIN)',
          style: {
            color: theme.palette.text.secondary,
            fontFamily: theme.typography.fontFamily,
            fontSize: '12px'
          }
        },
        labels: {
          style: {
            colors: theme.palette.text.secondary,
            fontFamily: theme.typography.fontFamily,
            fontSize: '12px'
          },
          formatter: (value: number) => `${(value / 1000).toFixed(0)}K`
        }
      },
      {
        opposite: true,
        title: {
          text: 'تعداد شرکت‌کنندگان',
          style: {
            color: theme.palette.text.secondary,
            fontFamily: theme.typography.fontFamily,
            fontSize: '12px'
          }
        },
        labels: {
          style: {
            colors: theme.palette.text.secondary,
            fontFamily: theme.typography.fontFamily,
            fontSize: '12px'
          }
        }
      }
    ]
  }

  const series = [
    {
      name: 'موجودی استخر',
      data: chartData.balances
    },
    {
      name: 'شرکت‌کنندگان',
      data: chartData.participants
    }
  ]

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title='روند رشد موجودی استخر'
        titleTypographyProps={{ 
          variant: 'h6', 
          sx: { letterSpacing: '0.15px', fontWeight: 600 } 
        }}
        subheader={
          <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
            <Box>
              <Typography variant='caption' color='text.secondary'>
                رشد کل:
              </Typography>
              <Typography 
                variant='body2' 
                sx={{ 
                  fontWeight: 600, 
                  color: stats.totalGrowth >= 0 ? 'success.main' : 'error.main' 
                }}
              >
                {stats.totalGrowth >= 0 ? '+' : ''}{stats.totalGrowth.toFixed(1)}%
              </Typography>
            </Box>
            <Box>
              <Typography variant='caption' color='text.secondary'>
                میانگین تغییرات:
              </Typography>
              <Typography variant='body2' sx={{ fontWeight: 600 }}>
                {stats.avgChange.toFixed(1)}%
              </Typography>
            </Box>
          </Box>
        }
      />
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ReactApexcharts type='line' height={300} options={options} series={series} />
      </CardContent>
    </Card>
  )
}

export default PoolGrowthTrend


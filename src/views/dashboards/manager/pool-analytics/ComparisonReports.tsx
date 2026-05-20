'use client'

// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { useTheme } from '@mui/material/styles'

// ** Third Party Imports
import { ApexOptions } from 'apexcharts'

// ** Custom Components Imports
import ReactApexcharts from 'src/@core/components/react-apexcharts'

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

// ** Types
import type { ComparisonData } from 'src/types/manager/pool-analytics'

interface ComparisonReportsProps {
  monthlyData: ComparisonData[]
  quarterlyData: ComparisonData[]
}

const ComparisonReports = ({ monthlyData, quarterlyData }: ComparisonReportsProps) => {
  const theme = useTheme()
  const [viewType, setViewType] = useState<'monthly' | 'quarterly'>('monthly')

  const currentData = viewType === 'monthly' ? monthlyData : quarterlyData

  // ** Chart Options
  const chartOptions: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false },
      stacked: false
    },
    colors: [
      hexToRGBA(theme.palette.primary.main, 1),
      hexToRGBA(theme.palette.success.main, 1),
      hexToRGBA(theme.palette.warning.main, 1)
    ],
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '45%',
        dataLabels: {
          position: 'top'
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      labels: {
        colors: theme.palette.text.secondary
      },
      fontFamily: theme.typography.fontFamily,
      fontSize: '13px',
      markers: {
        width: 10,
        height: 10,
        offsetX: -5
      }
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
        top: 0,
        left: 10,
        right: 10,
        bottom: 0
      }
    },
    xaxis: {
      categories: currentData.map(d => d.period),
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
          text: 'شرکت‌کنندگان',
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
    ],
    tooltip: {
      theme: theme.palette.mode,
      y: {
        formatter: (value: number, opts: any) => {
          if (opts.seriesIndex === 0) {
            return `${value.toLocaleString('fa-IR')} TWIN`
          } else if (opts.seriesIndex === 1) {
            return `${value.toLocaleString('fa-IR')} نفر`
          } else {
            return `${value.toLocaleString('fa-IR')}`
          }
        }
      }
    }
  }

  const series = [
    {
      name: 'موجودی استخر',
      data: currentData.map(d => d.poolBalance)
    },
    {
      name: 'شرکت‌کنندگان',
      data: currentData.map(d => d.participants)
    },
    {
      name: 'میانگین امتیاز',
      data: currentData.map(d => d.avgScore)
    }
  ]

  // ** Calculate comparison stats
  const latestPeriod = currentData[currentData.length - 1]
  const previousPeriod = currentData[currentData.length - 2]
  
  const balanceChange = previousPeriod 
    ? ((latestPeriod.poolBalance - previousPeriod.poolBalance) / previousPeriod.poolBalance) * 100
    : 0
  
  const participantChange = previousPeriod
    ? ((latestPeriod.participants - previousPeriod.participants) / previousPeriod.participants) * 100
    : 0

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title='گزارشات مقایسه‌ای'
        titleTypographyProps={{ 
          variant: 'h6', 
          sx: { letterSpacing: '0.15px', fontWeight: 600 } 
        }}
        action={
          <ToggleButtonGroup
            exclusive
            size='small'
            value={viewType}
            onChange={(e, newValue) => {
              if (newValue !== null) {
                setViewType(newValue)
              }
            }}
          >
            <ToggleButton value='monthly'>ماهانه</ToggleButton>
            <ToggleButton value='quarterly'>فصلی</ToggleButton>
          </ToggleButtonGroup>
        }
      />
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Comparison Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper
              }}
            >
              <Typography variant='caption' color='text.secondary' sx={{ mb: 1, display: 'block' }}>
                تغییر موجودی استخر
              </Typography>
              <Typography 
                variant='h6' 
                sx={{ 
                  fontWeight: 600,
                  color: balanceChange >= 0 ? 'success.main' : 'error.main'
                }}
              >
                {balanceChange >= 0 ? '+' : ''}{balanceChange.toFixed(1)}%
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                نسبت به دوره قبل
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper
              }}
            >
              <Typography variant='caption' color='text.secondary' sx={{ mb: 1, display: 'block' }}>
                تغییر شرکت‌کنندگان
              </Typography>
              <Typography 
                variant='h6' 
                sx={{ 
                  fontWeight: 600,
                  color: participantChange >= 0 ? 'success.main' : 'error.main'
                }}
              >
                {participantChange >= 0 ? '+' : ''}{participantChange.toFixed(1)}%
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                نسبت به دوره قبل
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Chart */}
        <Box sx={{ flex: 1 }}>
          <ReactApexcharts 
            type='bar' 
            height={300} 
            options={chartOptions} 
            series={series} 
          />
        </Box>

        {/* Period Details */}
        <Box sx={{ mt: 3, pt: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 2 }}>
            آخرین دوره ({latestPeriod.period})
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Typography variant='caption' color='text.secondary'>
                موجودی استخر
              </Typography>
              <Typography variant='body2' sx={{ fontWeight: 600 }}>
                {latestPeriod.poolBalance.toLocaleString('fa-IR')}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant='caption' color='text.secondary'>
                شرکت‌کنندگان
              </Typography>
              <Typography variant='body2' sx={{ fontWeight: 600 }}>
                {latestPeriod.participants.toLocaleString('fa-IR')}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant='caption' color='text.secondary'>
                میانگین امتیاز
              </Typography>
              <Typography variant='body2' sx={{ fontWeight: 600 }}>
                {latestPeriod.avgScore.toLocaleString('fa-IR')}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  )
}

export default ComparisonReports


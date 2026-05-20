'use client'

// ** React Imports
import { useMemo } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

// ** Third Party Imports
import { ApexOptions } from 'apexcharts'

// ** Custom Components Imports
import ReactApexcharts from 'src/@core/components/react-apexcharts'
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

// ** Types
import type { ParticipantStats } from 'src/types/manager/pool-analytics'

interface ParticipantAnalyticsProps {
  data: ParticipantStats
}

const ParticipantAnalytics = ({ data }: ParticipantAnalyticsProps) => {
  const theme = useTheme()

  // ** Prepare Regional Chart Data
  const regionalChartData = useMemo(() => {
    const topRegions = data.regions.slice(0, 8) // Top 8 regions
    return {
      categories: topRegions.map(r => r.region),
      data: topRegions.map(r => r.count)
    }
  }, [data.regions])

  // ** Regional Bar Chart Options
  const regionalOptions: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    colors: [hexToRGBA(theme.palette.primary.main, 1)],
    plotOptions: {
      bar: {
        borderRadius: 6,
        distributed: false,
        columnWidth: '45%',
        dataLabels: {
          position: 'top'
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => val.toLocaleString('fa-IR'),
      offsetY: -20,
      style: {
        fontSize: '11px',
        colors: [theme.palette.text.primary],
        fontFamily: theme.typography.fontFamily
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
      categories: regionalChartData.categories,
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
    yaxis: {
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontFamily: theme.typography.fontFamily,
          fontSize: '12px'
        }
      }
    },
    tooltip: {
      theme: theme.palette.mode,
      y: {
        formatter: (value: number) => `${value.toLocaleString('fa-IR')} نفر`
      }
    }
  }

  const regionalSeries = [
    {
      name: 'تعداد شرکت‌کنندگان',
      data: regionalChartData.data
    }
  ]

  // ** Daily Growth Area Chart Options
  const dailyGrowthOptions: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false },
      sparkline: { enabled: true }
    },
    colors: [hexToRGBA(theme.palette.success.main, 1)],
    stroke: {
      curve: 'smooth',
      width: 2
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 0.9,
        opacityFrom: 0.5,
        opacityTo: 0.1,
        stops: [0, 100]
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
    },
    tooltip: {
      theme: theme.palette.mode,
      x: { show: false },
      y: {
        formatter: (value: number) => `${value} نفر`
      }
    },
    xaxis: {
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false }
    },
    yaxis: {
      labels: { show: false }
    }
  }

  const dailyGrowthSeries = [
    {
      name: 'رشد روزانه',
      data: data.dailyGrowth
    }
  ]

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title='تحلیل شرکت‌کنندگان'
        titleTypographyProps={{ 
          variant: 'h6', 
          sx: { letterSpacing: '0.15px', fontWeight: 600 } 
        }}
      />
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid item xs={12} sm={4}>
            <Box
              sx={{
                p: 3,
                borderRadius: 1,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CustomAvatar skin='light' variant='rounded' color='primary' sx={{ width: 36, height: 36, mr: 2 }}>
                  <Icon icon='mdi:account-group' fontSize='1.25rem' />
                </CustomAvatar>
                <Typography variant='h5' sx={{ fontWeight: 600 }}>
                  {data.total.toLocaleString('fa-IR')}
                </Typography>
              </Box>
              <Typography variant='body2' color='text.secondary'>
                کل شرکت‌کنندگان
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Box
              sx={{
                p: 3,
                borderRadius: 1,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CustomAvatar skin='light' variant='rounded' color='success' sx={{ width: 36, height: 36, mr: 2 }}>
                  <Icon icon='mdi:account-plus' fontSize='1.25rem' />
                </CustomAvatar>
                <Typography variant='h5' sx={{ fontWeight: 600 }}>
                  {data.newThisMonth.toLocaleString('fa-IR')}
                </Typography>
              </Box>
              <Typography variant='body2' color='text.secondary'>
                عضو جدید این ماه
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Box
              sx={{
                p: 3,
                borderRadius: 1,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CustomAvatar skin='light' variant='rounded' color='info' sx={{ width: 36, height: 36, mr: 2 }}>
                  <Icon icon='mdi:trending-up' fontSize='1.25rem' />
                </CustomAvatar>
                <Typography 
                  variant='h5' 
                  sx={{ 
                    fontWeight: 600,
                    color: data.growth >= 0 ? 'success.main' : 'error.main'
                  }}
                >
                  {data.growth >= 0 ? '+' : ''}{data.growth.toFixed(1)}%
                </Typography>
              </Box>
              <Typography variant='body2' color='text.secondary'>
                نرخ رشد
              </Typography>
            </Box>
          </Grid>

          {/* Daily Growth Chart */}
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1 }}>
                روند رشد روزانه (30 روز اخیر)
              </Typography>
              <ReactApexcharts 
                type='area' 
                height={80} 
                options={dailyGrowthOptions} 
                series={dailyGrowthSeries} 
              />
            </Box>
          </Grid>

          {/* Regional Distribution Chart */}
          <Grid item xs={12}>
            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 2 }}>
              توزیع جغرافیایی شرکت‌کنندگان
            </Typography>
            <ReactApexcharts 
              type='bar' 
              height={220} 
              options={regionalOptions} 
              series={regionalSeries} 
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default ParticipantAnalytics


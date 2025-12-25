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
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Chip from '@mui/material/Chip'
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
import type { PerformanceMetrics } from 'src/types/manager/pool-analytics'

interface PerformanceMetricsDashboardProps {
  data: PerformanceMetrics
}

const PerformanceMetricsDashboard = ({ data }: PerformanceMetricsDashboardProps) => {
  const theme = useTheme()

  // ** Distribution Chart Options
  const distributionOptions: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    colors: [hexToRGBA(theme.palette.warning.main, 1)],
    plotOptions: {
      bar: {
        borderRadius: 6,
        distributed: false,
        columnWidth: '50%',
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
        fontSize: '10px',
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
        left: 0,
        right: 0,
        bottom: 0
      }
    },
    xaxis: {
      categories: data.distribution.map(d => d.range),
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontFamily: theme.typography.fontFamily,
          fontSize: '11px'
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

  const distributionSeries = [
    {
      name: 'تعداد',
      data: data.distribution.map(d => d.count)
    }
  ]

  // ** Get medal color based on rank
  const getMedalColor = (rank: number) => {
    if (rank === 1) return '#FFD700' // Gold
    if (rank === 2) return '#C0C0C0' // Silver
    if (rank === 3) return '#CD7F32' // Bronze
    return theme.palette.text.secondary
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title='متریک‌های عملکرد'
        titleTypographyProps={{ 
          variant: 'h6', 
          sx: { letterSpacing: '0.15px', fontWeight: 600 } 
        }}
      />
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Grid container spacing={3}>
          {/* KPI Cards */}
          <Grid item xs={6} sm={3}>
            <Box
              sx={{
                p: 2.5,
                borderRadius: 1,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
                textAlign: 'center'
              }}
            >
              <CustomAvatar 
                skin='light' 
                variant='rounded' 
                color='primary' 
                sx={{ width: 40, height: 40, mb: 1.5, mx: 'auto' }}
              >
                <Icon icon='mdi:chart-line' fontSize='1.5rem' />
              </CustomAvatar>
              <Typography variant='h6' sx={{ fontWeight: 600, mb: 0.5 }}>
                {data.avgScore.toLocaleString('fa-IR')}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                میانگین امتیاز
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Box
              sx={{
                p: 2.5,
                borderRadius: 1,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
                textAlign: 'center'
              }}
            >
              <CustomAvatar 
                skin='light' 
                variant='rounded' 
                color='success' 
                sx={{ width: 40, height: 40, mb: 1.5, mx: 'auto' }}
              >
                <Icon icon='mdi:trophy' fontSize='1.5rem' />
              </CustomAvatar>
              <Typography variant='h6' sx={{ fontWeight: 600, mb: 0.5 }}>
                {data.topScore.toLocaleString('fa-IR')}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                بالاترین امتیاز
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Box
              sx={{
                p: 2.5,
                borderRadius: 1,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
                textAlign: 'center'
              }}
            >
              <CustomAvatar 
                skin='light' 
                variant='rounded' 
                color='info' 
                sx={{ width: 40, height: 40, mb: 1.5, mx: 'auto' }}
              >
                <Icon icon='mdi:chart-bell-curve' fontSize='1.5rem' />
              </CustomAvatar>
              <Typography variant='h6' sx={{ fontWeight: 600, mb: 0.5 }}>
                {data.medianScore.toLocaleString('fa-IR')}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                میانه امتیاز
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Box
              sx={{
                p: 2.5,
                borderRadius: 1,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
                textAlign: 'center'
              }}
            >
              <CustomAvatar 
                skin='light' 
                variant='rounded' 
                color='error' 
                sx={{ width: 40, height: 40, mb: 1.5, mx: 'auto' }}
              >
                <Icon icon='mdi:arrow-down' fontSize='1.5rem' />
              </CustomAvatar>
              <Typography variant='h6' sx={{ fontWeight: 600, mb: 0.5 }}>
                {data.lowestScore.toLocaleString('fa-IR')}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                پایین‌ترین امتیاز
              </Typography>
            </Box>
          </Grid>

          {/* Distribution Chart */}
          <Grid item xs={12}>
            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 2 }}>
              توزیع امتیازات
            </Typography>
            <ReactApexcharts 
              type='bar' 
              height={180} 
              options={distributionOptions} 
              series={distributionSeries} 
            />
          </Grid>

          {/* Top 10 Performers Table */}
          <Grid item xs={12}>
            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 2 }}>
              برترین عملکردها (Top 10)
            </Typography>
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>رتبه</TableCell>
                    <TableCell>نام</TableCell>
                    <TableCell align='center'>امتیاز</TableCell>
                    <TableCell align='center'>زیرمجموعه</TableCell>
                    <TableCell align='center'>منطقه</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.topPerformers.slice(0, 10).map((performer) => (
                    <TableRow key={performer.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {performer.rank <= 3 ? (
                            <Icon 
                              icon='mdi:medal' 
                              fontSize='1.25rem' 
                              style={{ color: getMedalColor(performer.rank) }}
                            />
                          ) : (
                            <Typography variant='body2' sx={{ fontWeight: 600 }}>
                              {performer.rank}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' sx={{ fontWeight: 500 }}>
                          {performer.name}
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>
                        <Chip 
                          label={performer.score.toLocaleString('fa-IR')}
                          size='small'
                          color='primary'
                          variant='tonal'
                        />
                      </TableCell>
                      <TableCell align='center'>
                        <Typography variant='body2' color='text.secondary'>
                          {performer.subordinates.toLocaleString('fa-IR')}
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>
                        <Typography variant='body2' color='text.secondary'>
                          {performer.region}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default PerformanceMetricsDashboard


'use client'

// ** React Imports
import { useMemo } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import { useTheme } from '@mui/material/styles'

// ** Third Party Imports
import { ApexOptions } from 'apexcharts'

// ** Custom Components Imports
import ReactApexcharts from 'src/@core/components/react-apexcharts'

export interface FundData {
  id: string
  name: string
  symbol: string
  category: string
  investors: number
  capital: number
  percentage: number
}

interface FundDistributionProps {
  funds: FundData[]
  totalInvestors: number
}

const FundDistribution = ({ funds, totalInvestors }: FundDistributionProps) => {
  const theme = useTheme()

  const chartData = useMemo(() => {
    return funds.map(fund => fund.investors)
  }, [funds])

  const labels = useMemo(() => {
    return funds.map(fund => fund.name)
  }, [funds])

  const colors = useMemo(() => {
    return [
      theme.palette.primary.main,
      theme.palette.success.main,
      theme.palette.info.main,
      theme.palette.warning.main,
      theme.palette.error.main,
      theme.palette.secondary.main,
      '#9C27B0',
      '#795548',
      '#607D8B'
    ]
  }, [theme])

  const options: ApexOptions = {
    chart: {
      type: 'donut',
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    legend: {
      show: true,
      position: 'bottom',
      labels: {
        colors: theme.palette.text.secondary,
        useSeriesColors: false
      }
    },
    stroke: {
      width: 5,
      colors: [theme.palette.background.paper]
    },
    colors,
    labels,
    tooltip: {
      theme: theme.palette.mode,
      enabled: true,
      style: {
        fontSize: '13px',
        fontFamily: theme.typography.fontFamily
      },
      y: {
        formatter: (val: number) => {
          const percentage = ((val / totalInvestors) * 100).toFixed(1)
          return `${val.toLocaleString('fa-IR')} نفر (${percentage}%)`
        },
        title: {
          formatter: (seriesName: string) => seriesName
        }
      },
      fillSeriesColor: false,
      marker: {
        show: true,
        fillColors: colors
      },
      fixed: {
        enabled: false
      }
    },
    dataLabels: {
      enabled: false
    },
    states: {
      hover: {
        filter: { type: 'none' }
      },
      active: {
        filter: { type: 'none' }
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: {
              show: false
            },
            total: {
              label: 'کل سرمایه‌گذاران',
              show: true,
              fontWeight: 600,
              fontSize: '1rem',
              color: theme.palette.text.secondary,
              formatter: () => totalInvestors.toLocaleString('fa-IR')
            },
            value: {
              show: true,
              offsetY: 6,
              fontWeight: 600,
              fontSize: '1.25rem',
              formatter: (val: string) => {
                const num = parseInt(val)
                return num.toLocaleString('fa-IR')
              },
              color: theme.palette.text.primary
            }
          }
        }
      }
    }
  }

  const series = chartData

  const formatCurrency = (amount: number) => {
    const formattedNumber = amount.toLocaleString('fa-IR')
    return `${formattedNumber} ریال`
  }

  return (
    <Card>
      <CardHeader
        title='توزیع صندوق‌ها'
        titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 600 } }}
        subheader={
          <Typography variant='body2' color='text.secondary'>
            درصد سرمایه‌گذاران در هر صندوق
          </Typography>
        }
      />
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <ReactApexcharts type='donut' height={350} options={options} series={series} />
        </Box>
        <Box>
          {funds.map((fund, index) => {
            const fundColor = colors[index % colors.length]
            return (
              <Box
                key={fund.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  p: 2.5,
                  mb: 2,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                    boxShadow: theme.shadows[2],
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                {/* Color Indicator */}
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: fundColor,
                    flexShrink: 0,
                    boxShadow: `0 0 0 3px ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
                  }}
                />
                
                {/* Fund Info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5, flexWrap: 'wrap' }}>
                    <Typography variant='body1' sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                      {fund.name}
                    </Typography>
                    {fund.symbol && (
                      <Chip 
                        label={fund.symbol} 
                        size='small' 
                        sx={{ 
                          height: 22,
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          backgroundColor: theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.1)' 
                            : 'rgba(0, 0, 0, 0.05)',
                          border: `1px solid ${theme.palette.divider}`
                        }} 
                      />
                    )}
                  </Box>
                  <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.75rem' }}>
                    {fund.category}
                  </Typography>
                </Box>
                
                {/* Statistics */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.75, minWidth: 140 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant='body2' sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      {fund.investors.toLocaleString('fa-IR')}
                    </Typography>
                    <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.75rem' }}>
                      نفر
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography 
                      variant='body2' 
                      sx={{ 
                        fontWeight: 600,
                        color: fundColor,
                        fontSize: '0.85rem'
                      }}
                    >
                      {fund.percentage.toFixed(1)}%
                    </Typography>
                  </Box>
                  <Typography 
                    variant='caption' 
                    color='text.secondary' 
                    sx={{ 
                      fontSize: '0.7rem',
                      fontWeight: 500
                    }}
                  >
                    {formatCurrency(fund.capital)}
                  </Typography>
                </Box>
              </Box>
            )
          })}
        </Box>
      </CardContent>
    </Card>
  )
}

export default FundDistribution

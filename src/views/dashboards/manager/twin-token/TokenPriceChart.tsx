'use client'

// ** React Imports
import { useMemo } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'

// ** Third Party Imports
import { ApexOptions } from 'apexcharts'

// ** Custom Components Imports
import ReactApexcharts from 'src/@core/components/react-apexcharts'

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

import type { TwinPriceCandle } from 'src/types/api/twin-token'

interface TokenPriceChartProps {
  currentPrice: number
  priceChange24h: number
  candles: TwinPriceCandle[]
}

const TokenPriceChart = ({ currentPrice, priceChange24h, candles }: TokenPriceChartProps) => {
  const theme = useTheme()

  const chartData = useMemo(() => candles, [candles])

  const options: ApexOptions = {
    chart: {
      type: 'candlestick',
      parentHeightOffset: 0,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: theme.palette.success.main,
          downward: theme.palette.error.main
        },
        wick: {
          useFillColor: true
        }
      }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontFamily: theme.typography.fontFamily
        },
        datetimeFormatter: {
          hour: 'HH:mm',
          day: 'dd MMM'
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontFamily: theme.typography.fontFamily
        },
        formatter: (val: number) => {
          return `${val.toFixed(2)} ریال`
        }
      },
      opposite: false
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      },
      padding: {
        top: 0,
        right: 10,
        bottom: 0,
        left: 10
      }
    },
    tooltip: {
      theme: theme.palette.mode,
      custom: ({ seriesIndex, dataPointIndex, w }) => {
        const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex]
        const [open, high, low, close] = data.y
        const date = new Date(data.x)
        
        const change = close - open
        const changePercent = ((change / open) * 100).toFixed(2)
        
        return `
          <div style="padding: 10px; background: ${theme.palette.background.paper}; border: 1px solid ${theme.palette.divider}; border-radius: 4px;">
            <div style="font-weight: 600; margin-bottom: 8px;">
              ${date.toLocaleString('fa-IR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <div style="display: flex; justify-content: space-between;">
                <span>باز:</span>
                <span style="font-weight: 600;">${open.toFixed(2)} ریال</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>بسته:</span>
                <span style="font-weight: 600; color: ${close >= open ? theme.palette.success.main : theme.palette.error.main};">${close.toFixed(2)} ریال</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>بالا:</span>
                <span style="font-weight: 600;">${high.toFixed(2)} ریال</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>پایین:</span>
                <span style="font-weight: 600;">${low.toFixed(2)} ریال</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-top: 4px; padding-top: 4px; border-top: 1px solid ${theme.palette.divider};">
                <span>تغییر:</span>
                <span style="font-weight: 600; color: ${change >= 0 ? theme.palette.success.main : theme.palette.error.main};">
                  ${change >= 0 ? '+' : ''}${change.toFixed(2)} ریال (${changePercent}%)
                </span>
              </div>
            </div>
          </div>
        `
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      width: 1
    },
    states: {
      hover: {
        filter: {
          type: 'none'
        }
      },
      active: {
        filter: {
          type: 'none'
        }
      }
    }
  }

  const series = [
    {
      name: 'قیمت توکن TWIN',
      data: chartData
    }
  ]

  return (
    <Card>
      <CardHeader
        title='نمودار قیمت لحظه‌ای'
        titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 600 } }}
        subheader={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            <Typography variant='body2' color='text.secondary'>
              قیمت فعلی:
            </Typography>
            <Typography 
              variant='h6' 
              sx={{ 
                fontWeight: 600,
                color: priceChange24h >= 0 ? theme.palette.success.main : theme.palette.error.main
              }}
            >
              {currentPrice.toFixed(2)} ریال
            </Typography>
            <Typography 
              variant='body2' 
              sx={{ 
                color: priceChange24h >= 0 ? theme.palette.success.main : theme.palette.error.main,
                fontWeight: 600
              }}
            >
              {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
            </Typography>
          </Box>
        }
      />
      <CardContent>
        <ReactApexcharts 
          type='candlestick' 
          height={400} 
          options={options} 
          series={series} 
        />
      </CardContent>
    </Card>
  )
}

export default TokenPriceChart

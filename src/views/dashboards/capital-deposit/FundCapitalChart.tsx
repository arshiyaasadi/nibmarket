'use client'

// ** React Imports
import { useMemo } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

// ** Third Party Imports
import { ApexOptions } from 'apexcharts'

// ** Custom Components Imports
import ReactApexcharts from 'src/@core/components/react-apexcharts'

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

// ** Types
import { FundData } from './FundDistribution'

interface FundCapitalChartProps {
  funds: FundData[]
}

const FundCapitalChart = ({ funds }: FundCapitalChartProps) => {
  const theme = useTheme()

  const chartData = useMemo(() => {
    return funds.map(fund => fund.capital)
  }, [funds])

  const categories = useMemo(() => {
    return funds.map(fund => fund.symbol || fund.name)
  }, [funds])

  // Use same colors as FundDistribution chart
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
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    colors: colors.map(color => hexToRGBA(color, 1)),
    plotOptions: {
      bar: {
        borderRadius: 6,
        distributed: true,
        columnWidth: '60%',
        dataLabels: {
          position: 'top'
        }
      }
    },
    dataLabels: {
      enabled: false
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
      categories,
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontFamily: theme.typography.fontFamily,
          fontSize: '11px'
        },
        rotate: -45,
        rotateAlways: false
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
        },
        formatter: (val: number) => {
          const formatted = val.toLocaleString('fa-IR', {
            notation: 'compact',
            compactDisplay: 'short'
          })
          return `ریال ${formatted}`
        }
      }
    },
    tooltip: {
      theme: theme.palette.mode,
      enabled: true,
      style: {
        fontSize: '13px',
        fontFamily: theme.typography.fontFamily,
        color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.primary
      },
      y: {
        formatter: (val: number) => {
          const formatted = val.toLocaleString('fa-IR')
          return `${formatted} ریال`
        },
        title: {
          formatter: (seriesName: string) => seriesName
        }
      },
      fillSeriesColor: false,
      marker: {
        show: true
      },
      x: {
        formatter: (val: string) => val
      },
      fixed: {
        enabled: false
      }
    }
  }

  const series = [
    {
      name: 'حجم سرمایه',
      data: chartData
    }
  ]

  return (
    <Card>
      <CardHeader
        title='حجم سرمایه صندوق‌ها'
        titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 600 } }}
        subheader={
          <Typography variant='body2' color='text.secondary'>
            مقایسه حجم سرمایه در هر صندوق
          </Typography>
        }
      />
      <CardContent>
        <ReactApexcharts type='bar' height={350} options={options} series={series} />
      </CardContent>
    </Card>
  )
}

export default FundCapitalChart

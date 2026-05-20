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

interface SubordinatesCapitalDistributionProps {
  data: { range: string; count: number; percentage: number }[]
  totalUsers: number
}

const SubordinatesCapitalDistribution = ({ data, totalUsers }: SubordinatesCapitalDistributionProps) => {
  const theme = useTheme()

  const chartData = useMemo(() => {
    return data.map(item => item.count)
  }, [data])

  const categories = useMemo(() => {
    return data.map(item => item.range)
  }, [data])

  const options: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    colors: [hexToRGBA(theme.palette.info.main, 1)],
    plotOptions: {
      bar: {
        borderRadius: 6,
        distributed: false,
        columnWidth: '60%',
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
        formatter: (val: number) => val.toLocaleString('fa-IR')
      }
    },
    tooltip: {
      theme: theme.palette.mode,
      y: {
        formatter: (val: number) => {
          const percentage = ((val / totalUsers) * 100).toFixed(1)
          return `${val.toLocaleString('fa-IR')} نفر (${percentage}%)`
        }
      }
    }
  }

  const series = [
    {
      name: 'تعداد کاربران',
      data: chartData
    }
  ]

  return (
    <Card>
      <CardHeader
        title='توزیع سرمایه زیرمجموعه‌ها'
        titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 600 } }}
      />
      <CardContent>
        <ReactApexcharts type='bar' height={300} options={options} series={series} />
        <Box sx={{ mt: 4 }}>
          {data.map((item, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 1.5,
                borderBottom: index < data.length - 1 ? `1px solid ${theme.palette.divider}` : 'none'
              }}
            >
              <Typography variant='body2'>{item.range}</Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Typography variant='body2' sx={{ fontWeight: 600 }}>
                  {item.count.toLocaleString('fa-IR')} نفر
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {item.percentage.toFixed(1)}%
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  )
}

export default SubordinatesCapitalDistribution

// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// ** Third Party Imports
import { ApexOptions } from 'apexcharts'

// ** Custom Components Imports
import Icon from 'src/@core/components/icon'
import ReactApexcharts from 'src/@core/components/react-apexcharts'

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

// Sample data for daily growth (twin token quantity)
const series = [{ 
  name: 'رشد روزانه',
  data: [5, 8, 12, 15, 18, 22, 25, 28, 30, 35, 38, 42, 45, 48, 50, 55, 58, 60, 65, 68, 70, 75, 78, 80, 85, 88, 90, 95, 98, 100]
}]

const CrmDailyGrowthLine = () => {
  // ** State
  const [hasData, setHasData] = useState(false) // Set to false to show empty state

  // ** Hook
  const theme = useTheme()

  // ** Handler
  const handleRefresh = () => {
    // This function can be used to fetch data from API
    // For now, we'll just toggle the state to show data
    setHasData(true)
  }

  const options: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    colors: [hexToRGBA(theme.palette.success.main, 1)],
    stroke: { 
      curve: 'smooth',
      width: 3
    },
    dataLabels: { enabled: false },
    markers: {
      size: 5,
      strokeWidth: 3,
      strokeColors: [theme.palette.background.paper],
      colors: [theme.palette.success.main],
      hover: { size: 6 }
    },
    grid: {
      strokeDashArray: 6,
      borderColor: theme.palette.divider,
      xaxis: {
        lines: { show: true }
      },
      yaxis: {
        lines: { show: false }
      },
      padding: {
        top: -10,
        left: -7,
        right: 7,
        bottom: -10
      }
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (val: number) => `${val.toLocaleString('fa-IR')} توکن`
      }
    },
    xaxis: {
      labels: {
        style: { colors: theme.palette.text.disabled },
        formatter: (val: string) => {
          const day = parseInt(val)

          return day <= 30 ? `روز ${day}` : val
        }
      },
      axisTicks: { show: false },
      axisBorder: { show: false },
      categories: Array.from({ length: 30 }, (_, i) => (i + 1).toString())
    },
    yaxis: {
      labels: {
        style: { colors: theme.palette.text.disabled },
        formatter: (val: number) => val.toLocaleString('fa-IR')
      }
    }
  }

  // If no data, show empty state
  if (!hasData) {
    return (
      <Card>
        <CardHeader
          title='رشد روزانه زیرمجموعه'
          titleTypographyProps={{ variant: 'h6', sx: { letterSpacing: '0.15px', fontWeight: 600 } }}
        />
        <CardContent sx={{ p: 6 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 300,
              gap: 3
            }}
          >
            <Icon icon='mdi:chart-line-variant' fontSize='4rem' style={{ color: theme.palette.text.disabled }} />
            <Typography variant='body2' sx={{ color: 'text.secondary', fontSize: '0.875rem', fontWeight: 500 }}>
              اطلاعاتی هنوز ثبت نشده
            </Typography>
            <Button
              variant='contained'
              startIcon={<Icon icon='mdi:refresh' />}
              onClick={handleRefresh}
              sx={{ mt: 2, fontSize: '0.875rem' }}
            >
              به روزرسانی
            </Button>
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title='رشد روزانه زیرمجموعه'
        titleTypographyProps={{ variant: 'h6', sx: { letterSpacing: '0.15px', fontWeight: 600 } }}
      />
      <CardContent sx={{ p: 6 }}>
        <ReactApexcharts type='line' height={300} options={options} series={series} />
      </CardContent>
    </Card>
  )
}

export default CrmDailyGrowthLine


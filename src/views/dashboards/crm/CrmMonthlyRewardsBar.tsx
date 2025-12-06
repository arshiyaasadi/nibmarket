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

// Sample data for monthly rewards (line chart)
const series = [{
  data: [150, 200, 180, 250, 300, 280, 350, 400, 380, 450, 420, 500]
}]

const CrmMonthlyRewardsBar = () => {
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
      zoom: { enabled: false },
      toolbar: { show: false },
      background: 'transparent'
    },
    colors: [theme.palette.warning.main],
    stroke: { 
      curve: 'straight',
      width: 3
    },
    fill: {
      type: 'solid',
      opacity: 0
    },
    dataLabels: { enabled: false },
    markers: {
      strokeWidth: 7,
      strokeOpacity: 1,
      colors: [theme.palette.warning.main],
      strokeColors: [theme.palette.background.paper]
    },
    grid: {
      padding: { top: -10 },
      borderColor: theme.palette.divider,
      xaxis: {
        lines: { show: true }
      },
      yaxis: {
        lines: { show: false }
      }
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (val: number) => `${val.toLocaleString('fa-IR')} توکن`
      }
    },
    xaxis: {
      axisBorder: { show: false },
      axisTicks: { color: theme.palette.divider },
      crosshairs: {
        stroke: { color: theme.palette.divider }
      },
      labels: {
        style: { colors: theme.palette.text.disabled }
      },
      categories: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
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
          title='پاداش ماهانه کسب شده'
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
        title='پاداش ماهانه کسب شده'
        titleTypographyProps={{ variant: 'h6', sx: { letterSpacing: '0.15px', fontWeight: 600 } }}
      />
      <CardContent sx={{ p: 6 }}>
        <ReactApexcharts type='line' height={300} options={options} series={series} />
      </CardContent>
    </Card>
  )
}

export default CrmMonthlyRewardsBar


// ** MUI Imports
import Card from '@mui/material/Card'
import { useTheme } from '@mui/material/styles'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// ** Third Party Imports
import { ApexOptions } from 'apexcharts'

// ** Custom Components Imports
import ReactApexcharts from 'src/@core/components/react-apexcharts'

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

// Sample data for monthly rewards (twin token quantity)
const series = [{ 
  name: 'پاداش ماهانه',
  data: [150, 200, 180, 250, 300, 280, 350, 400, 380, 450, 420, 500]
}]

const CrmMonthlyRewardsLine = () => {
  // ** Hook
  const theme = useTheme()

  const options: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    colors: [hexToRGBA(theme.palette.primary.main, 1)],
    stroke: { 
      curve: 'smooth',
      width: 3
    },
    dataLabels: { enabled: false },
    markers: {
      size: 5,
      strokeWidth: 3,
      strokeColors: [theme.palette.background.paper],
      colors: [theme.palette.primary.main],
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
          const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']
          return months[parseInt(val) - 1] || val
        }
      },
      axisTicks: { show: false },
      axisBorder: { show: false },
      categories: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
    },
    yaxis: {
      labels: {
        style: { colors: theme.palette.text.disabled },
        formatter: (val: number) => val.toLocaleString('fa-IR')
      }
    }
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

export default CrmMonthlyRewardsLine


// ** MUI Imports
import Card from '@mui/material/Card'
import { useTheme } from '@mui/material/styles'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// ** Third Party Imports
import { ApexOptions } from 'apexcharts'

// ** Custom Components Imports
import ReactApexcharts from 'src/@core/components/react-apexcharts'
import DashboardWidgetState from 'src/components/dashboard/DashboardWidgetState'

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

// ** Hooks
import { useDashboardMonthlyRewards } from 'src/hooks/dashboard/useDashboardMonthlyRewards'

const CrmMonthlyRewardsLine = () => {
  const theme = useTheme()
  const { data, loading, retrying, error, usedFallback, refetch } = useDashboardMonthlyRewards()

  const series = [
    {
      name: data.seriesName,
      data: data.points.map(p => p.amount)
    }
  ]

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
          const idx = parseInt(val) - 1

          return data.points[idx]?.monthLabel || val
        }
      },
      axisTicks: { show: false },
      axisBorder: { show: false },
      categories: data.points.map(p => String(p.month))
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
      <DashboardWidgetState
        loading={loading}
        retrying={retrying}
        error={error}
        usedFallback={usedFallback}
        onRetry={refetch}
        skeletonHeight={300}
        widgetTitle='پاداش ماهانه'
        isEmpty={!loading && data.points.length === 0}
      >
        <CardContent sx={{ p: 6 }}>
          <ReactApexcharts type='line' height={300} options={options} series={series} />
        </CardContent>
      </DashboardWidgetState>
    </Card>
  )
}

export default CrmMonthlyRewardsLine

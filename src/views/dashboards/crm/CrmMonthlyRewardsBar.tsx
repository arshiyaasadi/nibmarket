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
import DashboardWidgetState from 'src/components/dashboard/DashboardWidgetState'

// ** Hooks
import { useDashboardMonthlyRewardsTrend } from 'src/hooks/dashboard/useDashboardMonthlyRewardsTrend'

const CrmMonthlyRewardsBar = () => {
  const theme = useTheme()
  const { data, loading, retrying, error, usedFallback, refetch } = useDashboardMonthlyRewardsTrend()

  const series = [
    {
      data: data.points.map(p => p.amount)
    }
  ]

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
      categories: data.points.map(p => String(p.month))
    },
    yaxis: {
      labels: {
        style: { colors: theme.palette.text.disabled },
        formatter: (val: number) => val.toLocaleString('fa-IR')
      }
    }
  }

  const showEmptyState = !loading && !data.hasData

  return (
    <Card>
      <CardHeader
        title='توکن ماهانه کسب شده'
        titleTypographyProps={{ variant: 'h6', sx: { letterSpacing: '0.15px', fontWeight: 600 } }}
      />
      <DashboardWidgetState
        loading={loading}
        retrying={retrying}
        error={error}
        usedFallback={usedFallback}
        onRetry={refetch}
        skeletonHeight={300}
        widgetTitle='توکن ماهانه'
      >
        {showEmptyState ? (
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
                onClick={refetch}
                sx={{ mt: 2, fontSize: '0.875rem' }}
              >
                به روزرسانی
              </Button>
            </Box>
          </CardContent>
        ) : (
          <CardContent sx={{ p: 6 }}>
            <ReactApexcharts type='line' height={300} options={options} series={series} />
          </CardContent>
        )}
      </DashboardWidgetState>
    </Card>
  )
}

export default CrmMonthlyRewardsBar

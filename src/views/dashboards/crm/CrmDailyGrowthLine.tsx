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

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

// ** Hooks
import { useDashboardDailyGrowth } from 'src/hooks/dashboard/useDashboardDailyGrowth'

const CrmDailyGrowthLine = () => {
  const theme = useTheme()
  const { data, loading, retrying, error, usedFallback, refetch } = useDashboardDailyGrowth()

  const series = [
    {
      name: data.seriesName,
      data: data.points.map(p => p.count)
    }
  ]

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
      categories: data.points.map(p => String(p.day))
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
        title='رشد روزانه زیرمجموعه'
        titleTypographyProps={{ variant: 'h6', sx: { letterSpacing: '0.15px', fontWeight: 600 } }}
      />
      <DashboardWidgetState
        loading={loading}
        retrying={retrying}
        error={error}
        usedFallback={usedFallback}
        onRetry={refetch}
        skeletonHeight={300}
        widgetTitle='رشد روزانه زیرمجموعه'
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

export default CrmDailyGrowthLine

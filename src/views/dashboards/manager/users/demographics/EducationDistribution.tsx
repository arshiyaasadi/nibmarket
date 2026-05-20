'use client'

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

interface EducationDistributionProps {
  data: { education: string; count: number; percentage: number }[]
  totalUsers: number
}

const EducationDistribution = ({ data, totalUsers }: EducationDistributionProps) => {
  const theme = useTheme()

  const chartData = data.map(item => item.count)
  const labels = data.map(item => item.education)

  const options: ApexOptions = {
    chart: {
      type: 'pie',
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
      width: 3,
      colors: [theme.palette.background.paper]
    },
    colors: [
      theme.palette.primary.main,
      theme.palette.success.main,
      theme.palette.info.main,
      theme.palette.warning.main,
      theme.palette.error.main
    ],
    labels,
    tooltip: {
      theme: theme.palette.mode,
      y: {
        formatter: (val: number) => {
          const percentage = ((val / totalUsers) * 100).toFixed(1)
          return `${val.toLocaleString('fa-IR')} نفر (${percentage}%)`
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`,
      style: {
        fontSize: '12px',
        fontFamily: theme.typography.fontFamily
      }
    },
    states: {
      hover: {
        filter: { type: 'none' }
      },
      active: {
        filter: { type: 'none' }
      }
    }
  }

  const series = chartData

  return (
    <Card>
      <CardHeader
        title='توزیع تحصیلات کاربران'
        titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 600 } }}
      />
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <ReactApexcharts type='pie' height={300} options={options} series={series} />
        </Box>
        <Box>
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
              <Typography variant='body2'>{item.education}</Typography>
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

export default EducationDistribution

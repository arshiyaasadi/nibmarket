// ** React Imports
import { MouseEvent, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'

// ** Third Party Imports
import { ApexOptions } from 'apexcharts'

// ** Custom Components Imports
import CustomAvatar from 'src/@core/components/mui/avatar'
import ReactApexcharts from 'src/@core/components/react-apexcharts'

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

// Sample leaderboard data with growth data
const leaderboardData = [
  {
    rank: 1,
    name: 'علی احمدی',
    subordinates: 45,
    totalPoints: 12500,
    growthData: [20, 35, 45, 30, 50, 60, 75]
  },
  {
    rank: 2,
    name: 'محمد رضایی',
    subordinates: 38,
    totalPoints: 11200,
    growthData: [15, 25, 30, 40, 35, 50, 65]
  },
  {
    rank: 3,
    name: 'فاطمه کریمی',
    subordinates: 32,
    totalPoints: 9800,
    growthData: [10, 20, 25, 30, 35, 40, 45]
  },
  {
    rank: 4,
    name: 'حسن موسوی',
    subordinates: 28,
    totalPoints: 8750,
    growthData: [5, 15, 20, 25, 30, 35, 40]
  },
  {
    rank: 5,
    name: 'زهرا نوری',
    subordinates: 25,
    totalPoints: 8200,
    growthData: [8, 12, 18, 22, 28, 32, 38]
  }
]

const CrmProjectTimeline = () => {
  // ** State
  const [filter, setFilter] = useState<string>('current')
  const theme = useTheme()

  const handleFilter = (event: MouseEvent<HTMLElement>, newFilter: string | null) => {
    if (newFilter !== null) {
      setFilter(newFilter)
    }
  }

  // Mini line chart options
  const getMiniChartOptions = (data: number[], color: string): ApexOptions => ({
    chart: {
      sparkline: { enabled: true },
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    stroke: {
      width: 2,
      curve: 'smooth',
      colors: [color]
    },
    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 0.3,
        opacityTo: 0.1,
        stops: [0, 100]
      }
    },
    colors: [color],
    grid: {
      show: false,
      padding: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      }
    },
    tooltip: { enabled: false },
    xaxis: {
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false }
    },
    yaxis: {
      labels: { show: false }
    },
    dataLabels: { enabled: false }
  })

  return (
    <Card>
      <CardHeader
        title='لیدربورد'
        titleTypographyProps={{ sx: { letterSpacing: '0.15px', fontWeight: 600 } }}
        action={
          <ToggleButtonGroup exclusive value={filter} onChange={handleFilter} size='small'>
            <ToggleButton value='current'>ماه جاری</ToggleButton>
            <ToggleButton value='previous'>ماه گذشته</ToggleButton>
          </ToggleButtonGroup>
        }
        sx={{
          flexDirection: ['column', 'row'],
          alignItems: ['flex-start', 'center'],
          '& .MuiCardHeader-action': { mb: [2, 0], mt: [0, 0] }
        }}
      />
      <Divider />
      <CardContent>
        <Stack spacing={3}>
          {leaderboardData.map((person, index) => (
            <Box key={person.rank}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 4
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, minWidth: 0, flex: 1 }}>
                  <CustomAvatar
                    skin='light'
                    sx={{
                      width: 40,
                      height: 40,
                      fontSize: '1rem',
                      fontWeight: 600,
                      bgcolor: index === 0 ? 'primary.main' : index === 1 ? 'secondary.main' : index === 2 ? 'success.main' : 'action.selected'
                    }}
                  >
                    {person.rank}
                  </CustomAvatar>
                  <Typography variant='body1' sx={{ fontWeight: 600, minWidth: 0, mr: 2 }}>
                    {person.name}
                  </Typography>
                  <Box sx={{ width: 60, height: 30 }}>
                    <ReactApexcharts
                      type='area'
                      height={30}
                      series={[{ data: person.growthData }]}
                      options={getMiniChartOptions(
                        person.growthData,
                        index === 0
                          ? theme.palette.primary.main
                          : index === 1
                            ? theme.palette.secondary.main
                            : index === 2
                              ? theme.palette.success.main
                              : theme.palette.info.main
                      )}
                    />
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <Box sx={{ textAlign: 'center', minWidth: 130 }}>
                    <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                      تعداد زیرمجموعه
                    </Typography>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>
                      {person.subordinates}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ textAlign: 'center', minWidth: 130 }}>
                    <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                      مجموع امتیازات
                    </Typography>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>
                      {person.totalPoints.toLocaleString('fa-IR')}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              {index < leaderboardData.length - 1 && <Divider sx={{ mt: 3 }} />}
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  )
}

export default CrmProjectTimeline

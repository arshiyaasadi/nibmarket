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
import DashboardWidgetState from 'src/components/dashboard/DashboardWidgetState'

// ** Hooks
import { useDashboardLeaderboard } from 'src/hooks/dashboard/useDashboardLeaderboard'
import type { LeaderboardPeriod } from 'src/types/api/dashboard'

const CrmProjectTimeline = () => {
  const [filter, setFilter] = useState<LeaderboardPeriod>('current')
  const theme = useTheme()
  const { data, loading, retrying, error, usedFallback, refetch } = useDashboardLeaderboard(filter)
  const leaderboardData = data.entries

  const handleFilter = (event: MouseEvent<HTMLElement>, newFilter: LeaderboardPeriod | null) => {
    if (newFilter !== null) {
      setFilter(newFilter)
    }
  }

  const getMiniChartOptions = (dataPoints: number[], color: string): ApexOptions => ({
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
        titleTypographyProps={{ variant: 'h6', sx: { letterSpacing: '0.15px', fontWeight: 600 } }}
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
      <DashboardWidgetState
        loading={loading}
        retrying={retrying}
        error={error}
        usedFallback={usedFallback}
        onRetry={refetch}
        skeletonHeight={320}
        widgetTitle='لیدربورد'
        isEmpty={!loading && leaderboardData.length === 0}
        emptyMessage='لیدربوردی برای نمایش وجود ندارد'
      >
        <CardContent sx={{ p: 6 }}>
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
                        backgroundColor: 'rgba(76, 78, 100, 0.08)',
                        color: theme.palette.primary.main
                      }}
                    >
                      {person.rank}
                    </CustomAvatar>
                    <Typography variant='body2' sx={{ fontWeight: 600, minWidth: 0, mr: 2, fontSize: '0.875rem' }}>
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
                      <Typography
                        variant='caption'
                        sx={{ color: 'text.secondary', display: 'block', mb: 0.5, fontSize: '0.75rem' }}
                      >
                        تعداد زیرمجموعه
                      </Typography>
                      <Typography variant='body2' sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        {person.subordinates}
                      </Typography>
                    </Box>

                    <Box sx={{ textAlign: 'center', minWidth: 130 }}>
                      <Typography
                        variant='caption'
                        sx={{ color: 'text.secondary', display: 'block', mb: 0.5, fontSize: '0.75rem' }}
                      >
                        مجموع توکن‌ها
                      </Typography>
                      <Typography variant='body2' sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
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
      </DashboardWidgetState>
    </Card>
  )
}

export default CrmProjectTimeline

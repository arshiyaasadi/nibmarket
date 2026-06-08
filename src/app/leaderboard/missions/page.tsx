'use client'

// ** React Imports
import { Suspense } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import { styled } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomChip from 'src/@core/components/mui/chip'
import DashboardWidgetState from 'src/components/dashboard/DashboardWidgetState'

// ** Hooks
import { useLeaderboardMissions } from 'src/hooks/leaderboard/useLeaderboardMissions'
import type { Mission } from 'src/types/api/leaderboard'

// ** Styled Components
const MissionCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  height: '100%',
  cursor: 'pointer',
  border: `1px solid ${theme.palette.divider}`
}))

const getMissionIcon = (id: number) => {
  const icons = [
    'mdi:account-plus',
    'mdi:shield-check',
    'mdi:account-group',
    'mdi:login',
    'mdi:account-network',
    'mdi:account-multiple',
    'mdi:account-supervisor',
    'mdi:account-multiple-check'
  ]

  return icons[id - 1] || 'mdi:star'
}

const MissionsPageContent = () => {
  const { data, loading, retrying, error, hasData, usedFallback, refetch } = useLeaderboardMissions()
  const missions = data.missions

  const handleMissionClick = (mission: Mission) => {
    if (!mission.completed) {
      console.log('Mission clicked:', mission)
    }
  }

  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 4 }}>
        ماموریت ها
      </Typography>
      <Card>
        <DashboardWidgetState
          loading={loading}
          retrying={retrying}
          error={error}
          usedFallback={usedFallback}
          onRetry={refetch}
          skeletonHeight={480}
          widgetTitle='ماموریت‌ها'
        >
          <CardHeader
            title='جدول فعالیت‌هایی که می‌توانید با تکمیل و انجام آن توکن بیاورید'
            titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 600 } }}
          />
          <CardContent sx={{ opacity: hasData ? 1 : 0.5 }}>
            <Grid container spacing={7}>
              {missions.map((mission: Mission) => (
                <Grid item xs={12} sm={6} key={mission.id}>
                  <MissionCard onClick={() => handleMissionClick(mission)}>
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                        <CustomAvatar
                          skin='light'
                          variant='rounded'
                          color={mission.completed ? 'success' : 'primary'}
                          sx={{
                            width: 56,
                            height: 56,
                            mr: 3,
                            borderRadius: 1.5
                          }}
                        >
                          <Icon icon={getMissionIcon(mission.id)} fontSize='1.75rem' />
                        </CustomAvatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant='body1'
                            sx={{
                              fontWeight: 600,
                              mb: 1,
                              fontSize: '0.9375rem',
                              color: mission.completed ? 'text.secondary' : 'text.primary'
                            }}
                          >
                            {mission.title}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
                            <Icon
                              icon='mdi:gift-outline'
                              fontSize={18}
                              style={{ color: mission.completed ? 'inherit' : undefined }}
                            />
                            <Typography variant='body2' sx={{ color: 'text.secondary', fontWeight: 500 }}>
                              توکن: {mission.reward}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Divider sx={{ mb: 3 }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <CustomChip
                          skin='light'
                          size='small'
                          label={mission.completed ? 'تکمیل شده' : 'در انتظار انجام'}
                          color={mission.completed ? 'success' : 'warning'}
                          sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                        />
                        {!mission.completed && (
                          <Icon icon='mdi:chevron-left' fontSize={20} style={{ color: 'inherit' }} />
                        )}
                      </Box>
                    </CardContent>
                  </MissionCard>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </DashboardWidgetState>
      </Card>
    </Box>
  )
}

const MissionsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MissionsPageContent />
    </Suspense>
  )
}

export default MissionsPage

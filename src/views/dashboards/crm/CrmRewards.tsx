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

// ** Types
import { ThemeColor } from 'src/@core/layouts/types'

// ** Custom Components Imports
import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomChip from 'src/@core/components/mui/chip'

interface RewardDataType {
  title: string
  stats: string
  trendNumber: string
  color: ThemeColor
  icon: string
  trend?: 'positive' | 'negative'
}

const rewardsData: RewardDataType[] = [
  {
    title: 'کل پاداش بدست آمده',
    stats: '0',
    trendNumber: '+0%',
    color: 'primary',
    icon: 'mdi:trophy',
    trend: 'positive'
  },
  {
    title: 'پاداش این ماه',
    stats: '0',
    trendNumber: '+0%',
    color: 'success',
    icon: 'mdi:calendar-month',
    trend: 'positive'
  },
  {
    title: 'پاداش تجمیع شده استخر',
    stats: '0',
    trendNumber: '+0%',
    color: 'info',
    icon: 'mdi:water',
    trend: 'positive'
  }
]

// ** Global Missions Data
import { missionsData, MissionType } from 'src/data/missions'

// ** Styled Components
const MissionCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  height: '100%',
  cursor: 'pointer',
  transition: 'all 0.3s ease-in-out',
  border: `1px solid ${theme.palette.divider}`,
  flexShrink: 0,
  minWidth: 280,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    borderColor: theme.palette.primary.main
  }
}))

const MissionsScrollContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(3),
  overflowX: 'auto',
  overflowY: 'hidden',
  pb: 2,
  '&::-webkit-scrollbar': {
    height: 8
  },
  '&::-webkit-scrollbar-thumb': {
    borderRadius: 4,
    backgroundColor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)'
  },
  '&::-webkit-scrollbar-track': {
    borderRadius: 4,
    backgroundColor: 'transparent'
  }
}))

// Mission icons mapping
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

const CrmRewards = () => {
  // Create a local copy of missions for display with first one completed for visual variety
  const displayMissions: MissionType[] = missionsData.slice(0, 3).map((mission, index) => ({
    ...mission,
    completed: index === 0 // Mark first mission as completed for demo
  }))

  const handleMissionClick = (mission: MissionType) => {
    if (!mission.completed) {
      // Handle mission click
      console.log('Mission clicked:', mission)
    }
  }

  return (
    <Card>
      <CardHeader
        title='پاداش‌ها'
        titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 600, letterSpacing: '0.15px' } }}
      />
      <CardContent sx={{ p: 6 }}>
        <Grid container spacing={4}>
          {rewardsData.map((reward: RewardDataType, index: number) => (
            <Grid item xs={12} sm={4} key={index}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: index !== rewardsData.length - 1 ? 0 : 0 }}>
                <CustomAvatar skin='light' variant='rounded' color={reward.color} sx={{ mr: 3, width: 50, height: 50 }}>
                  <Icon icon={reward.icon} fontSize='1.75rem' />
                </CustomAvatar>
                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant='h6' sx={{ fontWeight: 600, mr: 1.5 }}>
                      {reward.stats}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: reward.trend === 'positive' ? 'success.main' : 'error.main'
                      }}
                    >
                      <Typography
                        variant='subtitle2'
                        sx={{ color: reward.trend === 'positive' ? 'success.main' : 'error.main', fontSize: '0.875rem' }}
                      >
                        {reward.trendNumber}
                      </Typography>
                      <Box sx={{ ml: 0.25, display: 'inline-flex', alignItems: 'center' }}>
                        <Icon
                          icon={reward.trend === 'positive' ? 'mdi:chevron-up' : 'mdi:chevron-down'}
                          fontSize='1rem'
                        />
                      </Box>
                    </Box>
                  </Box>
                  <Typography variant='body2' sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                    {reward.title}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box>
          <Typography variant='h6' sx={{ fontWeight: 600, mb: 3, fontSize: '1rem' }}>
            ماموریت‌ها
          </Typography>
          <MissionsScrollContainer>
            {displayMissions.map((mission: MissionType) => (
              <MissionCard key={mission.id} onClick={() => handleMissionClick(mission)}>
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
                          textDecoration: mission.completed ? 'line-through' : 'none',
                          color: mission.completed ? 'text.secondary' : 'text.primary'
                        }}
                      >
                        {mission.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
                        <Icon
                          icon={mission.completed ? 'mdi:check-circle' : 'mdi:clock-outline'}
                          fontSize={16}
                          style={{
                            color: mission.completed ? '#2e7d32' : '#9e9e9e'
                          }}
                        />
                        <Typography
                          variant='caption'
                          sx={{
                            color: mission.completed ? 'success.main' : 'text.secondary',
                            fontWeight: 500,
                            fontSize: '0.75rem'
                          }}
                        >
                          {mission.completed ? 'تکمیل شده' : 'در انتظار'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2.5 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant='body2' sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                      پاداش:
                    </Typography>
                    <CustomChip
                      size='small'
                      label={mission.reward}
                      color='success'
                      skin='light'
                      sx={{
                        height: 28,
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        px: 2,
                        borderRadius: 1
                      }}
                    />
                  </Box>
                </CardContent>
              </MissionCard>
            ))}
          </MissionsScrollContainer>
        </Box>
      </CardContent>
    </Card>
  )
}

export default CrmRewards


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

// ** Global Missions Data
import { missionsData, MissionType } from 'src/data/missions'

// ** Styled Components
const MissionCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  height: '100%',
  cursor: 'pointer',
  transition: 'all 0.3s ease-in-out',
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    borderColor: theme.palette.primary.main
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

const MissionsPageContent = () => {
  const handleMissionClick = (mission: MissionType) => {
    if (!mission.completed) {
      // Handle mission click logic here
      console.log('Mission clicked:', mission)
    }
  }

  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 4 }}>
        ماموریت ها
      </Typography>
      <Card>
        <CardHeader
          title='جدول فعالیت هایی که فرد می تواند با تکمیل و انجام آن توکن بدست بیاورد'
          titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 600 } }}
        />
        <CardContent>
          <Grid container spacing={7}>
            {missionsData.map((mission: MissionType) => (
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
              </Grid>
            ))}
          </Grid>
        </CardContent>
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


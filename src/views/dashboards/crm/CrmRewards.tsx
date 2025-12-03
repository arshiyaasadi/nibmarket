// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton from '@mui/material/ListItemButton'

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

interface MissionType {
  id: number
  title: string
  completed: boolean
  reward: string
}

const missionsData: MissionType[] = [
  {
    id: 1,
    title: 'ماموریت اول',
    completed: true,
    reward: '+100'
  },
  {
    id: 2,
    title: 'ماموریت دوم',
    completed: false,
    reward: '+50'
  },
  {
    id: 3,
    title: 'ماموریت سوم',
    completed: false,
    reward: '+75'
  }
]

const CrmRewards = () => {
  const handleMissionClick = (mission: MissionType) => {
    if (!mission.completed) {
      alert('ماموریت هنوز شروع نشده')
    }
  }

  return (
    <Card>
      <CardHeader
        title='پاداش‌ها'
        titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 600 } }}
      />
      <CardContent>
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
                      <Icon
                        icon={reward.trend === 'positive' ? 'mdi:chevron-up' : 'mdi:chevron-down'}
                        fontSize='1rem'
                        sx={{ ml: 0.25 }}
                      />
                    </Box>
                  </Box>
                  <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                    {reward.title}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box>
          <Typography variant='h6' sx={{ fontWeight: 600, mb: 2 }}>
            ماموریت‌ها
          </Typography>
          {missionsData.map((mission: MissionType) => (
            <ListItem
              key={mission.id}
              disablePadding
              sx={{
                mb: 1.5,
                borderRadius: 1,
                border: theme => `1px solid ${theme.palette.divider}`,
                '&:hover': {
                  backgroundColor: theme => `rgba(${theme.palette.customColors.main}, 0.04)`
                }
              }}
            >
              <ListItemButton
                onClick={() => handleMissionClick(mission)}
                sx={{
                  borderRadius: 1,
                  py: 1.5,
                  px: 2
                }}
              >
                <Checkbox
                  checked={mission.completed}
                  disabled
                  size='small'
                  sx={{
                    mr: 1.5,
                    '&.Mui-checked': {
                      color: 'success.main'
                    },
                    '&.Mui-disabled': {
                      color: mission.completed ? 'success.main' : 'action.disabled'
                    }
                  }}
                />
                <ListItemText
                  primary={mission.title}
                  sx={{
                    flex: 1,
                    '& .MuiListItemText-primary': {
                      fontSize: '0.875rem',
                      textDecoration: mission.completed ? 'line-through' : 'none',
                      color: mission.completed ? 'text.secondary' : 'text.primary'
                    }
                  }}
                />
                <CustomChip
                  size='small'
                  label={mission.reward}
                  color='success'
                  skin='light'
                  sx={{ height: 24, fontSize: '0.75rem', fontWeight: 600 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </Box>
      </CardContent>
    </Card>
  )
}

export default CrmRewards


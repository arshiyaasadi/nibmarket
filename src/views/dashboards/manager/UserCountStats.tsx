'use client'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// ** Custom Components Imports
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

interface UserCountStatsProps {
  totalUsers: number
  growthPercentage: number
}

const UserCountStats = ({ totalUsers, growthPercentage }: UserCountStatsProps) => {
  const isPositive = growthPercentage >= 0
  const formattedGrowth = `${isPositive ? '+' : ''}${growthPercentage.toFixed(1)}%`

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', flex: 1, p: 2.5 }}>
        <Box sx={{ mb: 2, width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <CustomAvatar skin='light' variant='rounded' color='primary' sx={{ width: 36, height: 36 }}>
            <Icon icon='mdi:account-group' fontSize='1rem' />
          </CustomAvatar>
          <Box
            sx={{ display: 'flex', alignItems: 'center', color: isPositive ? 'success.main' : 'error.main' }}
          >
            <Typography variant='subtitle2' sx={{ color: isPositive ? 'success.main' : 'error.main', fontSize: '0.75rem' }}>
              {formattedGrowth}
            </Typography>
            <Icon icon={isPositive ? 'mdi:chevron-up' : 'mdi:chevron-down'} fontSize='1rem' />
          </Box>
        </Box>
        <Typography variant='h6' sx={{ mb: 0, fontSize: '1.25rem' }}>
          {totalUsers.toLocaleString('fa-IR')}
        </Typography>
        <Typography variant='body2' sx={{ fontSize: '0.75rem' }}>
          تعداد کل کاربران
        </Typography>
      </CardContent>
    </Card>
  )
}

export default UserCountStats


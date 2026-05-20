'use client'

// ** MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

// ** Custom Components Imports
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

interface DailyRegistrationsWidgetProps {
  todayRegistrations: number
}

const DailyRegistrationsWidget = ({ todayRegistrations }: DailyRegistrationsWidgetProps) => {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant='body2' color='text.secondary'>
              کاربران ثبت‌نامی امروز
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 600 }}>
              {todayRegistrations.toLocaleString('fa-IR')}
            </Typography>
          </Box>
          <CustomAvatar skin='light' variant='rounded' color='primary' sx={{ width: 56, height: 56 }}>
            <Icon icon='mdi:account-plus-outline' fontSize={28} />
          </CustomAvatar>
        </Box>
      </CardContent>
    </Card>
  )
}

export default DailyRegistrationsWidget

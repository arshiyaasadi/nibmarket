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

interface DailyChangeWidgetProps {
  changePercentage: number
}

const DailyChangeWidget = ({ changePercentage }: DailyChangeWidgetProps) => {
  const isPositive = changePercentage >= 0
  const color = isPositive ? 'success' : 'error'
  const icon = isPositive ? 'mdi:trending-up' : 'mdi:trending-down'

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant='body2' color='text.secondary'>
              درصد تغییرات نسبت به دیروز
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography 
                variant='h4' 
                sx={{ 
                  fontWeight: 600,
                  color: `${color}.main`
                }}
              >
                {isPositive ? '+' : ''}{changePercentage.toFixed(1)}%
              </Typography>
              <Icon icon={icon} fontSize={24} sx={{ color: `${color}.main` }} />
            </Box>
          </Box>
          <CustomAvatar skin='light' variant='rounded' color={color} sx={{ width: 56, height: 56 }}>
            <Icon icon={icon} fontSize={28} />
          </CustomAvatar>
        </Box>
      </CardContent>
    </Card>
  )
}

export default DailyChangeWidget

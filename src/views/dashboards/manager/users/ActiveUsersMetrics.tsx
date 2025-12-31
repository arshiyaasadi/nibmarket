'use client'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

// ** Custom Components Imports
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

interface ActiveUsersMetricsProps {
  totalSubordinates: number
  totalCapital: number
  totalSubordinatesCapital: number
}

const ActiveUsersMetrics = ({
  totalSubordinates,
  totalCapital,
  totalSubordinatesCapital
}: ActiveUsersMetricsProps) => {
  const totalCombinedCapital = totalCapital + totalSubordinatesCapital

  const metrics = [
    {
      title: 'تعداد زیرمجموعه',
      value: totalSubordinates,
      icon: 'mdi:account-network-outline',
      color: 'primary',
      format: (val: number) => val.toLocaleString('fa-IR')
    },
    {
      title: 'مجموعه سرمایه',
      value: totalCapital,
      icon: 'mdi:wallet-outline',
      color: 'success',
      format: (val: number) => `${val.toLocaleString('fa-IR')} ریال`
    },
    {
      title: 'سرمایه‌های زیرمجموعه',
      value: totalSubordinatesCapital,
      icon: 'mdi:account-group-outline',
      color: 'info',
      format: (val: number) => `${val.toLocaleString('fa-IR')} ریال`
    },
    {
      title: 'مجموع سرمایه',
      value: totalCombinedCapital,
      icon: 'mdi:chart-line',
      color: 'warning',
      format: (val: number) => `${val.toLocaleString('fa-IR')} ریال`
    }
  ]

  return (
    <Grid container spacing={4}>
      {metrics.map((metric, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant='body2' color='text.secondary'>
                  {metric.title}
                </Typography>
                <CustomAvatar skin='light' variant='rounded' color={metric.color} sx={{ width: 48, height: 48 }}>
                  <Icon icon={metric.icon} fontSize={24} />
                </CustomAvatar>
              </Box>
              <Typography variant='h5' sx={{ fontWeight: 600 }}>
                {metric.format(metric.value)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

export default ActiveUsersMetrics

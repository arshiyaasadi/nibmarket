'use client'

// ** MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import { useTheme } from '@mui/material/styles'

// ** Custom Components Imports
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

interface FundStatisticsProps {
  totalInvestors: number
  totalCapital: number
  firstInvestorsCapital: number
  networkCapital: number
}

const FundStatistics = ({
  totalInvestors,
  totalCapital,
  firstInvestorsCapital,
  networkCapital
}: FundStatisticsProps) => {
  const formatCurrency = (amount: number) => {
    const formattedNumber = amount.toLocaleString('fa-IR')
    return `${formattedNumber} ریال`
  }

  const statistics: Array<{
    title: string
    value: string
    icon: string
    color: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
  }> = [
    {
      title: 'تعداد سرمایه‌گذاران',
      value: totalInvestors.toLocaleString('fa-IR'),
      icon: 'mdi:account-group-outline',
      color: 'primary'
    },
    {
      title: 'حجم کل سرمایه',
      value: formatCurrency(totalCapital),
      icon: 'mdi:wallet-outline',
      color: 'success'
    },
    {
      title: 'سرمایه اولین نفرها',
      value: formatCurrency(firstInvestorsCapital),
      icon: 'mdi:account-star-outline',
      color: 'info'
    },
    {
      title: 'سرمایه مجموعه‌ها',
      value: formatCurrency(networkCapital),
      icon: 'mdi:account-network-outline',
      color: 'warning'
    }
  ]

  return (
    <Grid container spacing={4}>
      {statistics.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant='body2' color='text.secondary'>
                  {stat.title}
                </Typography>
                <CustomAvatar skin='light' variant='rounded' color={stat.color} sx={{ width: 48, height: 48 }}>
                  <Icon icon={stat.icon} fontSize={24} />
                </CustomAvatar>
              </Box>
              <Typography variant='h5' sx={{ fontWeight: 600 }}>
                {stat.value}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

export default FundStatistics

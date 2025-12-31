'use client'

// ** MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import { useTheme } from '@mui/material/styles'

// ** Custom Components Imports
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

interface TwinTokenStatisticsProps {
  poolBalance: number
  totalTokens: number
  circulatingTokens: number
  tokenPrice: number
  priceChange24h: number
  burnedTokens: number
}

const TwinTokenStatistics = ({
  poolBalance,
  totalTokens,
  circulatingTokens,
  tokenPrice,
  priceChange24h,
  burnedTokens
}: TwinTokenStatisticsProps) => {
  const theme = useTheme()

  const formatCurrency = (amount: number) => {
    const formattedNumber = amount.toLocaleString('fa-IR')
    return `${formattedNumber} ریال`
  }

  const formatToken = (amount: number) => {
    return amount.toLocaleString('fa-IR')
  }

  const circulatingPercentage = totalTokens > 0 ? (circulatingTokens / totalTokens) * 100 : 0

  const statistics = [
    {
      title: 'موجودی استخر',
      value: formatCurrency(poolBalance),
      icon: 'mdi:water',
      color: 'primary'
    },
    {
      title: 'تعداد کل توکن‌های TWIN',
      value: formatToken(totalTokens),
      icon: 'mdi:coin-outline',
      color: 'success'
    },
    {
      title: 'توکن‌های در گردش',
      value: `${formatToken(circulatingTokens)} (${circulatingPercentage.toFixed(2)}%)`,
      icon: 'mdi:currency-usd-circle-outline',
      color: 'info'
    },
    {
      title: 'ارزش توکن (لحظه‌ای)',
      value: formatCurrency(tokenPrice),
      icon: 'mdi:chart-line',
      color: 'warning'
    },
    {
      title: 'تغییر 24 ساعته',
      value: `${priceChange24h >= 0 ? '+' : ''}${priceChange24h.toFixed(2)}%`,
      icon: priceChange24h >= 0 ? 'mdi:trending-up' : 'mdi:trending-down',
      color: priceChange24h >= 0 ? 'success' : 'error'
    },
    {
      title: 'توکن‌های سوخته',
      value: formatToken(burnedTokens),
      icon: 'mdi:fire',
      color: 'error'
    }
  ]

  return (
    <Grid container spacing={4}>
      {statistics.map((stat, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
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
              <Typography 
                variant='h5' 
                sx={{ 
                  fontWeight: 600,
                  color: stat.color === 'error' && priceChange24h < 0 ? theme.palette.error.main : 
                         stat.color === 'success' && priceChange24h >= 0 ? theme.palette.success.main : 
                         'inherit'
                }}
              >
                {stat.value}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

export default TwinTokenStatistics

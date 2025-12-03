// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// Sample transaction data
const transactions = [
  {
    id: 1,
    type: 'deposit',
    amount: 5000,
    date: '۱۴۰۳/۰۹/۱۵',
    description: 'واریز توکن'
  },
  {
    id: 2,
    type: 'withdraw',
    amount: 2000,
    date: '۱۴۰۳/۰۹/۱۴',
    description: 'برداشت توکن'
  },
  {
    id: 3,
    type: 'deposit',
    amount: 3000,
    date: '۱۴۰۳/۰۹/۱۳',
    description: 'واریز توکن'
  }
]

const CrmTotalProfit = () => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <Typography variant='h5' sx={{ mb: 4, fontWeight: 600 }}>
          ولت
        </Typography>
        
        <Stack spacing={3} sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant='body1' sx={{ fontWeight: 500 }}>
              کل موجودی توکن:
            </Typography>
            <Typography variant='body1' sx={{ fontWeight: 600 }}>
              68.000تومان
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant='body1' sx={{ fontWeight: 500 }}>
              توکن قابل برداشت:
            </Typography>
            <Typography variant='body1' sx={{ fontWeight: 600 }}>
              38.000تومان
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant='body1' sx={{ fontWeight: 500 }}>
              توکن فریز:
            </Typography>
            <Typography variant='body1' sx={{ fontWeight: 600 }}>
              30.000تومان
            </Typography>
          </Box>
        </Stack>
        
        <Button 
          variant='contained' 
          fullWidth 
          sx={{ mb: 4, py: 1.5 }}
        >
          انتقال توکن
        </Button>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <Typography variant='subtitle2' sx={{ mb: 2, fontWeight: 600 }}>
            آخرین تراکنش‌ها
          </Typography>
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <Stack spacing={2}>
              {transactions.map((transaction, index) => (
                <Box key={transaction.id}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: transaction.type === 'deposit' ? 'success.light' : 'error.light'
                        }}
                      >
                        <Icon
                          icon={transaction.type === 'deposit' ? 'mdi:arrow-down' : 'mdi:arrow-up'}
                          fontSize={20}
                          style={{
                            color: transaction.type === 'deposit' ? '#2e7d32' : '#d32f2f'
                          }}
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          {transaction.description}
                        </Typography>
                        <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                          {transaction.date}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography
                      variant='body2'
                      sx={{
                        fontWeight: 600,
                        color: transaction.type === 'deposit' ? 'success.main' : 'error.main'
                      }}
                    >
                      {transaction.type === 'deposit' ? '+' : '-'}
                      {transaction.amount.toLocaleString('fa-IR')} تومان
                    </Typography>
                  </Box>
                  {index < 2 && <Divider sx={{ mt: 2 }} />}
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default CrmTotalProfit

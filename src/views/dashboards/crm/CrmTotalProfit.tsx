// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import { styled } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Styled Component for TWIN Badge
const TwinBadge = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 24,
  height: 24,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
  color: '#000',
  fontWeight: 700,
  fontSize: '0.5rem',
  letterSpacing: '0.2px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  lineHeight: 1
}))

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
  }
]

const CrmTotalProfit = () => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ p: 6, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <Typography variant='h6' sx={{ mb: 4, fontWeight: 600, letterSpacing: '0.15px' }}>
          ولت
        </Typography>
        
        <Stack spacing={4} sx={{ mb: 5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant='body2' sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
              کل موجودی توکن:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant='body2' sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                68.000
              </Typography>
              <TwinBadge>TWIN</TwinBadge>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant='body2' sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
              توکن قابل برداشت:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant='body2' sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                38.000
              </Typography>
              <TwinBadge>TWIN</TwinBadge>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant='body2' sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
              توکن فریز:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant='body2' sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                30.000
              </Typography>
              <TwinBadge>TWIN</TwinBadge>
            </Box>
          </Box>
        </Stack>
        
        <Button 
          variant='contained' 
          fullWidth 
          sx={{ mb: 4, py: 2, fontSize: '0.875rem' }}
        >
          انتقال توکن
        </Button>

        <Divider sx={{ mb: 4 }} />

        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <Typography variant='body2' sx={{ mb: 3, fontWeight: 600, fontSize: '0.875rem' }}>
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
                      <Icon
                        icon={transaction.type === 'deposit' ? 'mdi:arrow-down' : 'mdi:arrow-up'}
                        fontSize={20}
                        style={{
                          color: transaction.type === 'deposit' ? '#2e7d32' : '#d32f2f'
                        }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant='body2' sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                          {transaction.description}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography
                          variant='body2'
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            color: transaction.type === 'deposit' ? 'success.main' : 'error.main'
                          }}
                        >
                          {transaction.amount.toLocaleString('fa-IR')}
                        </Typography>
                        <TwinBadge>TWIN</TwinBadge>
                      </Box>
                      <Typography variant='caption' sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                        {transaction.date}
                      </Typography>
                    </Box>
                  </Box>
                  {index < transactions.length - 1 && <Divider sx={{ mt: 2 }} />}
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

// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import { styled } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Styled Component for TWIN Badge
const TwinBadge = styled(Box)(() => ({
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
  const [transactionsOpen, setTransactionsOpen] = useState<boolean>(false)

  return (
    <Card
      sx={theme => ({
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 4,
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 40%, ${theme.palette.info.main} 100%)`,
        color: theme.palette.common.white,
        boxShadow: '0 18px 40px rgba(15, 23, 42, 0.55)'
      })}
    >
      {/* Wallet strap + title */}
      <Box
        sx={theme => ({
          position: 'absolute',
          top: 18,
          left: 24,
          right: 24,
          height: 32,
          borderRadius: 999,
          background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.info.main} 100%)`,
          boxShadow: '0 6px 16px rgba(15, 23, 42, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          gap: 1
        })}
      >
        <Box
          sx={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.35)',
            backgroundColor: 'rgba(255,255,255,0.12)',
            boxShadow: 'inset 0 0 0 1px rgba(15,23,42,0.55)'
          }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1,
            marginRight:'auto' }}>
          <Icon icon='mdi:wallet' fontSize={22} />
          <Typography
            variant='subtitle1'
            sx={{ fontWeight: 700, letterSpacing: '0.15px', color: 'rgba(255,255,255,0.95)' }}
          >
            کیف پول
          </Typography>
        </Box>
      </Box>

      {/* Inner pocket */}
      <CardContent
        sx={{
          px: '35px',
          pt: '40px',
          pb: '40px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          position: 'relative'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: { xs: 16, sm: 20 },
            top: { xs: 64, sm: 72 },
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.6)',
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.28)',
            pointerEvents: 'none',
            opacity: 0.35
          }}
        />

        <Stack
          spacing={4}
          sx={{
            mb: 5,
            mt: '50px',
            backgroundColor: 'unset',
            background: 'unset'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography
              variant='body2'
              sx={{ fontWeight: 500, fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)' }}
            >
              کل موجودی توکن:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant='body2'
                sx={{ fontWeight: 700, fontSize: '1rem', color: 'rgba(255,255,255,0.6)' }}
              >
                68.000
              </Typography>
              <TwinBadge>TWIN</TwinBadge>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography
              variant='body2'
              sx={{ fontWeight: 500, fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)' }}
            >
              توکن قابل برداشت:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant='body2'
                sx={{ fontWeight: 600, fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)' }}
              >
                38.000
              </Typography>
              <TwinBadge>TWIN</TwinBadge>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography
              variant='body2'
              sx={{ fontWeight: 500, fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)' }}
            >
              توکن فریز:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant='body2'
                sx={{ fontWeight: 600, fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)' }}
              >
                30.000
              </Typography>
              <TwinBadge>TWIN</TwinBadge>
            </Box>
          </Box>
        </Stack>

        <Button
          variant='contained'
          fullWidth
          sx={{
            mb: 4,
            py: 2,
            fontSize: '0.9rem',
            borderRadius: 999,
            textTransform: 'none',
            background: 'linear-gradient(135deg, #FFD54F 0%, #FFB300 45%, #FF8F00 100%)',
            color: '#3E2723',
            boxShadow: '0 10px 22px rgba(0,0,0,0.45)',
            '&:hover': {
              background: 'linear-gradient(135deg, #FFE082 0%, #FFC107 45%, #FF9800 100%)',
              boxShadow: '0 12px 26px rgba(0,0,0,0.55)'
            }
          }}
        >
          انتقال توکن
        </Button>

        <Divider sx={{ mb: 4 }} />

        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <Accordion
            expanded={transactionsOpen}
            onChange={(_, expanded) => setTransactionsOpen(expanded)}
            sx={{
              bgcolor: 'transparent',
              boxShadow: 'none',
              color: 'inherit',
              '&::before': { display: 'none' },
              borderRadius: 3
            }}
          >
            <AccordionSummary
              aria-controls='wallet-transactions-content'
              id='wallet-transactions-header'
              expandIcon={
                <Icon
                  icon={transactionsOpen ? 'mdi:chevron-up' : 'mdi:chevron-down'}
                  fontSize={20}
                  style={{ color: 'rgba(255,255,255,0.7)' }}
                />
              }
              sx={{
                px: 0,
                py: 0,
                minHeight: 0,
                '& .MuiAccordionSummary-content': {
                  margin: 0
                }
              }}
            >
              <Typography
                variant='body2'
                sx={{ mb: 3, fontWeight: 600, fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)' }}
              >
                آخرین تراکنش‌ها
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 0, pt: 3, pb: 0 }}>
              <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
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
                            <Typography
                              variant='body2'
                              sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)' }}
                            >
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
                          <Typography
                            variant='caption'
                            sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}
                          >
                            {transaction.date}
                          </Typography>
                        </Box>
                      </Box>
                      {index < transactions.length - 1 && <Divider sx={{ mt: 2 }} />}
                    </Box>
                  ))}
                </Stack>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Box>
      </CardContent>
    </Card>
  )
}

export default CrmTotalProfit

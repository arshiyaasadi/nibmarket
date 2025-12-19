// ** React Imports
import React from 'react'

// ** Next Imports
import Link from 'next/link'

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

const CrmTotalProfit = () => {

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
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        boxShadow: theme.shadows[4],
        border: `1px solid ${theme.palette.divider}`
      })}
    >
      {/* Wallet strap + title */}
      <Box
        sx={theme => ({
          position: 'absolute',
          top: 18,
          left: 24,
          right: 24,
          height: 40,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          boxShadow: theme.shadows[4],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          px: 3,
          gap: 2
        })}
      >
        <Box
          sx={theme => ({
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: `2px solid ${theme.palette.common.white}`,
            backgroundColor: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: theme.shadows[2]
          })}
        >
          <Icon icon='mdi:wallet' fontSize={16} style={{ color: 'white' }} />
        </Box>
        <Typography
          variant='subtitle1'
          sx={{ fontWeight: 700, letterSpacing: '0.15px', color: theme => theme.palette.common.white }}
        >
          کیف پول
        </Typography>
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
          sx={theme => ({
            position: 'absolute',
            inset: { xs: 16, sm: 20 },
            top: { xs: 70, sm: 78 },
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.action.hover,
            pointerEvents: 'none',
            opacity: 0.5
          })}
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
          <Box 
            sx={theme => ({ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              p: 2.5,
              borderRadius: 2,
              backgroundColor: theme.palette.action.hover,
              border: `1px solid ${theme.palette.divider}`
            })}
          >
            <Typography
              variant='body2'
              sx={{ fontWeight: 500, fontSize: '0.875rem', color: 'text.secondary' }}
            >
              کل موجودی توکن:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant='h6'
                sx={{ fontWeight: 700, fontSize: '1.125rem', color: 'primary.main' }}
              >
                68.000
              </Typography>
              <TwinBadge>TWIN</TwinBadge>
            </Box>
          </Box>

          <Box 
            sx={theme => ({ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              p: 2.5,
              borderRadius: 2,
              backgroundColor: theme.palette.action.hover,
              border: `1px solid ${theme.palette.divider}`
            })}
          >
            <Typography
              variant='body2'
              sx={{ fontWeight: 500, fontSize: '0.875rem', color: 'text.secondary' }}
            >
              توکن قابل برداشت:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant='body1'
                sx={{ fontWeight: 600, fontSize: '1rem', color: 'success.main' }}
              >
                38.000
              </Typography>
              <TwinBadge>TWIN</TwinBadge>
            </Box>
          </Box>

          <Box 
            sx={theme => ({ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              p: 2.5,
              borderRadius: 2,
              backgroundColor: theme.palette.action.hover,
              border: `1px solid ${theme.palette.divider}`
            })}
          >
            <Typography
              variant='body2'
              sx={{ fontWeight: 500, fontSize: '0.875rem', color: 'text.secondary' }}
            >
              توکن فریز:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant='body1'
                sx={{ fontWeight: 600, fontSize: '1rem', color: 'warning.main' }}
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
          sx={theme => ({
            mb: 4,
            py: 1.75,
            fontSize: '0.95rem',
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
            color: theme.palette.common.white,
            boxShadow: theme.shadows[4],
            transition: 'all 0.3s ease',
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.warning.light} 0%, ${theme.palette.warning.main} 100%)`,
              boxShadow: theme.shadows[8],
              transform: 'translateY(-2px)'
            }
          })}
        >
          انتقال توکن
        </Button>

        <Divider sx={{ mb: 4 }} />

        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 'auto', pb: 2.25, pt: 2 }}>
          <Typography
            component={Link}
            href='/reports/wallet'
            variant='caption'
            sx={theme => ({
              fontSize: '0.75rem',
              color: 'text.secondary',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              px: 2,
              py: 1,
              transition: 'all 0.2s ease',
              '&:hover': {
                color: 'primary.main',
                textDecoration: 'underline'
              }
            })}
          >
            مشاهده تراکنش‌ها
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default CrmTotalProfit

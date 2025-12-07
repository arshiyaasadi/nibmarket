// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import { styled } from '@mui/material/styles'

// ** Styled Component for Enhanced Card
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[12]
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 3s ease-in-out infinite'
  },
  '@keyframes shimmer': {
    '0%': {
      backgroundPosition: '200% 0'
    },
    '100%': {
      backgroundPosition: '-200% 0'
    }
  }
}))

// ** Styled Component for TWIN Badge with Animation
const TwinBadge = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
  color: '#000',
  fontWeight: 700,
  fontSize: '0.75rem',
  letterSpacing: '0.2px',
  boxShadow: `0 4px 12px rgba(255, 215, 0, 0.4), 0 0 20px rgba(255, 215, 0, 0.2)`,
  lineHeight: 1,
  position: 'relative',
  animation: 'pulse 2s ease-in-out infinite',
  '@keyframes pulse': {
    '0%, 100%': {
      transform: 'scale(1)',
      boxShadow: `0 4px 12px rgba(255, 215, 0, 0.4), 0 0 20px rgba(255, 215, 0, 0.2)`
    },
    '50%': {
      transform: 'scale(1.05)',
      boxShadow: `0 6px 16px rgba(255, 215, 0, 0.6), 0 0 30px rgba(255, 215, 0, 0.4)`
    }
  }
}))

// ** Decorative Background Element
const DecorativeCircle = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: 200,
  height: 200,
  borderRadius: '50%',
  background: `radial-gradient(circle, ${theme.palette.primary.main}15 0%, transparent 70%)`,
  top: -50,
  right: -50,
  pointerEvents: 'none',
  zIndex: 0
}))

const PoolBalance = () => {
  const poolBalance = 1500000 // موجودی کل استخر
  const participantsCount = 1234 // تعداد شرکت‌کنندگان

  return (
    <StyledCard>
      <DecorativeCircle />
      <CardHeader
        title='موجودی استخر'
        titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 600, letterSpacing: '0.15px', position: 'relative', zIndex: 1 } }}
      />
      <CardContent
        sx={{
          p: 6,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Pool Balance Amount */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Typography
            variant='h3'
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 4px rgba(25, 118, 210, 0.2)'
            }}
          >
            {poolBalance.toLocaleString('fa-IR')}
          </Typography>
          <TwinBadge>TWIN</TwinBadge>
        </Box>
      </CardContent>
      
      {/* Participants Count Section */}
      <Divider />
      <Box
        sx={{
          p: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0.05) 100%)',
          position: 'relative',
          zIndex: 1
        }}
      >
        <Typography variant='body1' sx={{ color: 'text.secondary', fontWeight: 500 }}>
          {participantsCount.toLocaleString('fa-IR')} شرکت‌کننده
        </Typography>
      </Box>
    </StyledCard>
  )
}

export default PoolBalance


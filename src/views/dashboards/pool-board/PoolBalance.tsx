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
  },
  // Hover / active interactions for wave surface
  '&:hover .pool-wave': {
    animationDuration: '5s',
    transform: 'translateY(-2px) scaleY(1.04)'
  },
  '&:active .pool-wave': {
    animationDuration: '3s',
    transform: 'translateY(1px) scaleY(1.07)'
  }
}))

// ** Animated Fill Background to Simulate Pool Water Level
const FillBackground = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  height: '55%', // تقریبا ۵۰٪ پر شدن استخر
  background: 'unset',
  backdropFilter: 'blur(2px)',
  pointerEvents: 'none',
  zIndex: 0,
  overflow: 'hidden',
  // انیمیشن پر شدن در لحظه لود
  transform: 'translateY(100%)',
  animation: 'fillRise 1.8s ease-out forwards',
  // استایل موج‌های SVG
  '.pool-wave': {
    position: 'absolute',
    left: '-50%',
    bottom: '-10px',
    width: '200%',
    height: '120%',
    transformOrigin: 'center bottom'
  },
  '.pool-wave path': {
    fill: `${theme.palette.primary.main}55`
  },
  // موج عقب
  '.pool-wave--back': {
    opacity: 0.45,
    animation: 'waveMoveBack 11s ease-in-out infinite'
  },
  // موج جلو
  '.pool-wave--front': {
    opacity: 0.75,
    animation: 'waveMoveFront 7s ease-in-out infinite'
  },
  '@keyframes waveMoveFront': {
    '0%': {
      transform: 'translateX(0) translateY(4px)'
    },
    '50%': {
      transform: 'translateX(-25%) translateY(-4px)'
    },
    '100%': {
      transform: 'translateX(0) translateY(4px)'
    }
  },
  '@keyframes waveMoveBack': {
    '0%': {
      transform: 'translateX(0) translateY(2px) scaleY(0.96)'
    },
    '50%': {
      transform: 'translateX(-15%) translateY(-2px) scaleY(1.02)'
    },
    '100%': {
      transform: 'translateX(0) translateY(2px) scaleY(0.96)'
    }
  },
  '@keyframes fillRise': {
    '0%': {
      transform: 'translateY(100%)'
    },
    '100%': {
      transform: 'translateY(0)'
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
  const monthlyChangePercent = 12.5 // درصد تغییر این ماه

  return (
    <StyledCard>
      <DecorativeCircle />
      <FillBackground>
        <Box
          component='svg'
          className='pool-wave pool-wave--back'
          viewBox='0 0 1200 200'
          preserveAspectRatio='none'
        >
          <path d='M0,80 C 150,120 350,40 600,80 C 850,120 1050,40 1200,80 L1200,200 L0,200 Z' />
        </Box>
        <Box
          component='svg'
          className='pool-wave pool-wave--front'
          viewBox='0 0 1200 200'
          preserveAspectRatio='none'
        >
          <path d='M0,90 C 200,130 400,50 650,90 C 900,130 1100,50 1200,90 L1200,200 L0,200 Z' />
        </Box>
      </FillBackground>
      <CardHeader
        title='موجودی استخر'
        titleTypographyProps={{
          variant: 'h6',
          sx: { fontWeight: 600, letterSpacing: '0.15px', position: 'relative', zIndex: 1 }
        }}
        action={
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              position: 'relative',
              zIndex: 1
            }}
          >
            <Typography variant='h6' sx={{ fontWeight: 700, letterSpacing: '0.15px' }}>
              {`${monthlyChangePercent.toLocaleString('fa-IR')}٪`}
            </Typography>
            <Typography variant='caption' sx={{ color: 'text.secondary', mt: 1 }}>
              درصد تغییر این ماه
            </Typography>
          </Box>
        }
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
          backgroundColor: 'white',
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


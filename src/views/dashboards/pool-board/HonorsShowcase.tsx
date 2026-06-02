// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import { styled } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Styled Components
const HonorCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  transition: 'all 0.3s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    borderColor: theme.palette.primary.main
  }
}))

import type { HonorItem } from 'src/types/api/leaderboard'

type HonorsShowcaseProps = {
  honors: HonorItem[]
}

const HonorsShowcase = ({ honors }: HonorsShowcaseProps) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title='ویترین افتخارات'
        titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 600, letterSpacing: '0.15px' } }}
        action={
          <Icon icon='mdi:trophy-variant' fontSize={20} style={{ color: '#FFD700' }} />
        }
      />
      <CardContent sx={{ p: 6, flex: 1 }}>
        <Grid container spacing={3}>
          {honors.map((honor) => (
            <Grid item xs={6} sm={4} key={honor.id}>
              <HonorCard>
                <CustomAvatar
                  skin='light'
                  sx={{
                    width: 64,
                    height: 64,
                    mb: 2,
                    backgroundColor: `${honor.color}20`,
                    color: honor.color
                  }}
                >
                  <Icon icon={honor.icon} fontSize={32} />
                </CustomAvatar>
                <Typography variant='body1' sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }}>
                  {honor.title}
                </Typography>
                <Typography variant='caption' sx={{ color: 'text.secondary', textAlign: 'center', mb: 2 }}>
                  {honor.description}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    mb: 1.5,
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    backgroundColor: `${honor.color}15`,
                    border: `1px solid ${honor.color}30`
                  }}
                >
                  <Icon icon='mdi:numeric' fontSize={14} style={{ color: honor.color }} />
                  <Typography variant='caption' sx={{ fontWeight: 600, color: honor.color }}>
                    {honor.count}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    backgroundColor: `${honor.color}20`,
                    border: `1px solid ${honor.color}40`,
                    width: '100%',
                    justifyContent: 'center'
                  }}
                >
                  <Icon icon='mdi:star' fontSize={14} style={{ color: honor.color }} />
                  <Typography variant='caption' sx={{ fontWeight: 600, color: honor.color }}>
                    مجموع توکن کسب شده: {honor.totalPoints.toLocaleString('fa-IR')}
                  </Typography>
                </Box>
              </HonorCard>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default HonorsShowcase


// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import { useTheme } from '@mui/material/styles'
import { styled } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Styled Components
const RankBadge = styled(Box)<{ rank: number }>(({ theme, rank }) => {
  let backgroundColor = theme.palette.grey[300]
  let color = theme.palette.text.primary

  if (rank === 1) {
    backgroundColor = '#FFD700'
    color = '#000'
  } else if (rank === 2) {
    backgroundColor = '#C0C0C0'
    color = '#000'
  } else if (rank === 3) {
    backgroundColor = '#CD7F32'
    color = '#fff'
  }

  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 32,
    height: 32,
    borderRadius: '50%',
    backgroundColor,
    color,
    fontWeight: 700,
    fontSize: '0.875rem'
  }
})

// Mock leaderboard data for current month
const currentMonthLeaderboard = [
  { id: 1, rank: 1, name: 'علی احمدی', points: 12500, subordinates: 45 },
  { id: 2, rank: 2, name: 'محمد رضایی', points: 11200, subordinates: 38 },
  { id: 3, rank: 3, name: 'فاطمه کریمی', points: 9800, subordinates: 32 },
  { id: 4, rank: 4, name: 'حسن موسوی', points: 8750, subordinates: 28 },
  { id: 5, rank: 5, name: 'زهرا نوری', points: 8200, subordinates: 25 }
]

const CurrentMonthLeaderboard = () => {
  const theme = useTheme()

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title='لیدر بورد ماه جاری'
        titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 600, letterSpacing: '0.15px' } }}
        action={
          <Icon icon='mdi:trophy' fontSize={20} style={{ color: '#FFD700' }} />
        }
      />
      <CardContent sx={{ p: 6, flex: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {currentMonthLeaderboard.map((item, index) => (
            <Box key={item.id}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Name and Rank */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <RankBadge rank={item.rank}>{item.rank}</RankBadge>
                  <Typography variant='body1' sx={{ fontWeight: 600, flex: 1 }}>
                    {item.name}
                  </Typography>
                </Box>

                {/* Subordinates and Points */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3, pr: 5 }}>
                  {/* Subordinates */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Icon icon='mdi:account-multiple' fontSize={18} style={{ color: theme.palette.primary.main }} />
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                      زیر مجموعه:
                    </Typography>
                    <Typography variant='body1' sx={{ fontWeight: 600 }}>
                      {item.subordinates}
                    </Typography>
                  </Box>

                  {/* Total Points */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Icon icon='mdi:star' fontSize={18} style={{ color: '#FFD700' }} />
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                      مجموع امتیازات:
                    </Typography>
                    <Typography variant='body1' sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {item.points.toLocaleString('fa-IR')}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              {index < currentMonthLeaderboard.length - 1 && <Divider sx={{ mt: 3 }} />}
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  )
}

export default CurrentMonthLeaderboard


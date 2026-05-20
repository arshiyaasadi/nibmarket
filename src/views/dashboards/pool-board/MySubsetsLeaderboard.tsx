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
const RankBadge = styled(Box)<{ rank: number }>(({ theme }) => {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 32,
    height: 32,
    borderRadius: '50%',
    backgroundColor: 'rgba(76, 78, 100, 0.08)',
    color: theme.palette.primary.main,
    fontWeight: 700,
    fontSize: '0.875rem'
  }
})

import type { LeaderboardEntry } from 'src/types/api/leaderboard'

type MySubsetsLeaderboardProps = {
  entries: LeaderboardEntry[]
}

const MySubsetsLeaderboard = ({ entries }: MySubsetsLeaderboardProps) => {
  const theme = useTheme()

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title='لیدربورد زیرمجموعه‌های شما'
        titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 600, letterSpacing: '0.15px' } }}
        action={
          <Icon icon='mdi:account-group' fontSize={20} style={{ color: theme.palette.primary.main }} />
        }
      />
      <CardContent sx={{ p: 6, flex: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {entries.map((item, index) => (
            <Box key={item.id}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Name, Rank and Current Month Rank */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    <RankBadge rank={item.rank}>{item.rank}</RankBadge>
                    <Typography variant='body1' sx={{ fontWeight: 600 }}>
                      {item.name}
                    </Typography>
                  </Box>
                  {/* Current Month Rank */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Icon icon='mdi:trophy' fontSize={18} style={{ color: '#FFD700' }} />
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                      رتبه در ماه جاری:
                    </Typography>
                    <Typography variant='body1' sx={{ fontWeight: 600, color: 'warning.main' }}>
                      {item.currentMonthRank}
                    </Typography>
                  </Box>
                </Box>

                {/* Subordinates and Points */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
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
              {index < entries.length - 1 && <Divider sx={{ mt: 3 }} />}
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  )
}

export default MySubsetsLeaderboard


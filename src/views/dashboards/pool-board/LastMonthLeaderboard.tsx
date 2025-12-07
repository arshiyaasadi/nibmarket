// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import FormControl from '@mui/material/FormControl'
import Select, { SelectChangeEvent } from '@mui/material/Select'
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

// Mock leaderboard data for last month
const lastMonthLeaderboard = [
  { id: 1, rank: 1, name: 'حسین احمدی', points: 11800, subordinates: 42 },
  { id: 2, rank: 2, name: 'محمد رضایی', points: 10500, subordinates: 35 },
  { id: 3, rank: 3, name: 'فاطمه کریمی', points: 9200, subordinates: 30 },
  { id: 4, rank: 4, name: 'علی موسوی', points: 8100, subordinates: 26 },
  { id: 5, rank: 5, name: 'زهرا نوری', points: 7500, subordinates: 22 }
]

const LastMonthLeaderboard = () => {
  // ** State
  const [filter, setFilter] = useState<string>('all')

  // ** Handlers
  const handleFilterChange = (event: SelectChangeEvent) => {
    setFilter(event.target.value)
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title='لیدربورد ماه گذشته'
        titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 600, letterSpacing: '0.15px' } }}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl size='small' sx={{ minWidth: 120 }}>
              <Select
                value={filter}
                onChange={handleFilterChange}
                displayEmpty
                sx={{
                  '& .MuiSelect-select': {
                    py: 1,
                    fontSize: '0.875rem'
                  }
                }}
              >
                <MenuItem value='all'>همه</MenuItem>
                <MenuItem value='top10'>۱۰ نفر اول</MenuItem>
                <MenuItem value='top20'>۲۰ نفر اول</MenuItem>
                <MenuItem value='top50'>۵۰ نفر اول</MenuItem>
              </Select>
            </FormControl>
            <Icon icon='mdi:calendar-clock' fontSize={20} style={{ color: 'text.secondary' }} />
          </Box>
        }
      />
      <CardContent sx={{ p: 6, flex: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {lastMonthLeaderboard.map((item, index) => (
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
                    <Icon icon='mdi:account-multiple' fontSize={18} style={{ color: 'primary.main' }} />
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
              {index < lastMonthLeaderboard.length - 1 && <Divider sx={{ mt: 3 }} />}
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  )
}

export default LastMonthLeaderboard


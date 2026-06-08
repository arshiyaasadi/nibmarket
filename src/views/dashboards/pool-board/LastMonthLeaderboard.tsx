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
import { useTheme } from '@mui/material/styles'
import { styled } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

import type { LeaderboardEntry } from 'src/types/api/leaderboard'
import type { LeaderboardPeriod } from 'src/types/api/dashboard'

const RankBadge = styled(Box)<{ rank: number }>(({ theme }) => ({
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
}))

type LastMonthLeaderboardProps = {
  entries: LeaderboardEntry[]
  period?: LeaderboardPeriod
  onPeriodChange?: (period: LeaderboardPeriod) => void
}

const LastMonthLeaderboard = ({ entries, period, onPeriodChange }: LastMonthLeaderboardProps) => {
  const [localPeriod, setLocalPeriod] = useState<LeaderboardPeriod>('previous')
  const activePeriod = period ?? localPeriod
  const theme = useTheme()

  const handleFilterChange = (event: SelectChangeEvent) => {
    const value = event.target.value as LeaderboardPeriod
    if (onPeriodChange) {
      onPeriodChange(value)
    } else {
      setLocalPeriod(value)
    }
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title='لیدربورد ماه گذشته'
        titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 600, letterSpacing: '0.15px' } }}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl size='small' sx={{ minWidth: 140 }}>
              <Select
                value={activePeriod}
                onChange={handleFilterChange}
                sx={{
                  '& .MuiSelect-select': {
                    py: 1,
                    fontSize: '0.875rem'
                  }
                }}
              >
                <MenuItem value='current'>ماه جاری</MenuItem>
                <MenuItem value='previous'>ماه گذشته</MenuItem>
              </Select>
            </FormControl>
            <Icon icon='mdi:calendar-clock' fontSize={20} style={{ color: theme.palette.text.secondary }} />
          </Box>
        }
      />
      <CardContent sx={{ p: 6, flex: 1 }}>
        {entries.length === 0 ? (
          <Typography variant='body2' sx={{ color: 'text.secondary', textAlign: 'center', py: 6 }}>
            داده‌ای برای این بازه زمانی موجود نیست.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {entries.map((item, index) => (
              <Box key={`${item.rank}-${item.name}`}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <RankBadge rank={item.rank}>{item.rank}</RankBadge>
                    <Typography variant='body1' sx={{ fontWeight: 600, flex: 1 }}>
                      {item.name}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3, pr: 5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Icon icon='mdi:account-multiple' fontSize={18} style={{ color: theme.palette.primary.main }} />
                      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                        تعداد زیرمجموعه
                      </Typography>
                      <Typography variant='body1' sx={{ fontWeight: 600 }}>
                        {item.subordinates}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Icon icon='mdi:star' fontSize={18} style={{ color: '#FFD700' }} />
                      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                        مجموع توکن‌ها
                      </Typography>
                      <Typography variant='body1' sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {item.points.toLocaleString('fa-IR')}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                {index < entries.length - 1 ? <Divider sx={{ mt: 3 }} /> : null}
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default LastMonthLeaderboard

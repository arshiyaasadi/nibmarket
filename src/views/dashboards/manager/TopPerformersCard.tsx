'use client'

// ** MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Chip from '@mui/material/Chip'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Types
import type { PerformerData } from 'src/types/manager/pool-analytics'

interface TopPerformersCardProps {
  performers: PerformerData[]
}

// ** Helper function to get medal color
const getMedalColor = (rank: number): string => {
  if (rank === 1) return '#FFD700' // Gold
  if (rank === 2) return '#C0C0C0' // Silver
  if (rank === 3) return '#CD7F32' // Bronze
  return 'inherit'
}

const TopPerformersCard = ({ performers }: TopPerformersCardProps) => {
  return (
    <Card>
      <CardHeader
        title='برترین عملکردها'
        titleTypographyProps={{
          variant: 'h6',
          sx: { letterSpacing: '0.15px', fontWeight: 600 }
        }}
        action={
          <Chip 
            label='Top 10' 
            size='small' 
            color='primary' 
            variant='outlined'
          />
        }
      />
      <CardContent>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader size='small'>
            <TableHead>
              <TableRow>
                <TableCell>رتبه</TableCell>
                <TableCell>نام</TableCell>
                <TableCell align='center'>امتیاز</TableCell>
                <TableCell align='center'>زیرمجموعه</TableCell>
                <TableCell align='center'>منطقه</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {performers.slice(0, 10).map((performer) => (
                <TableRow 
                  key={performer.id} 
                  hover
                  sx={{
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {performer.rank <= 3 ? (
                        <Icon 
                          icon='mdi:medal' 
                          fontSize='1.5rem' 
                          style={{ color: getMedalColor(performer.rank) }}
                        />
                      ) : (
                        <Typography variant='body2' sx={{ fontWeight: 600, minWidth: 24 }}>
                          {performer.rank}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2' sx={{ fontWeight: 500 }}>
                      {performer.name}
                    </Typography>
                  </TableCell>
                  <TableCell align='center'>
                    <Chip 
                      label={performer.score.toLocaleString('fa-IR')}
                      size='small'
                      color={performer.rank <= 3 ? 'success' : 'primary'}
                      variant='outlined'
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align='center'>
                    <Typography variant='body2' color='text.secondary'>
                      {performer.subordinates.toLocaleString('fa-IR')}
                    </Typography>
                  </TableCell>
                  <TableCell align='center'>
                    <Typography variant='body2' color='text.secondary'>
                      {performer.region}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )
}

export default TopPerformersCard


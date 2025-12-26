'use client'

// ** React Imports
import { useMemo, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import { useState } from 'react'

// ** Types
import type { ObfuscatedLocation } from 'src/types/location'

interface ViewportUsersTableProps {
  visibleUsers: ObfuscatedLocation[]
  totalUsers: number
}

const ViewportUsersTable = ({ visibleUsers, totalUsers }: ViewportUsersTableProps) => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // ** Reset pagination when visible users change
  useEffect(() => {
    setPage(0)
  }, [visibleUsers])

  // ** Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // ** Sort users by capital (descending)
  const sortedUsers = useMemo(() => {
    return [...visibleUsers].sort((a, b) => b.capital - a.capital)
  }, [visibleUsers])

  // ** Paginated users
  const paginatedUsers = useMemo(() => {
    return sortedUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  }, [sortedUsers, page, rowsPerPage])

  // ** Format date to Persian
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // ** Format number to Persian with thousands separator
  const formatNumber = (num: number): string => {
    return num.toLocaleString('fa-IR')
  }

  return (
    <Card>
      <CardHeader
        title='کاربران قابل مشاهده در نقشه'
        titleTypographyProps={{ 
          variant: 'h6', 
          sx: { letterSpacing: '0.15px', fontWeight: 600 } 
        }}
        subheader={
          <Box sx={{ display: 'flex', gap: 2, mt: 1, alignItems: 'center' }}>
            <Typography variant='body2' color='text.secondary'>
              {formatNumber(visibleUsers.length)} کاربر از {formatNumber(totalUsers)} کاربر در محدوده نمایش
            </Typography>
            <Chip 
              label={`${((visibleUsers.length / totalUsers) * 100).toFixed(1)}%`} 
              size='small' 
              color='primary' 
              variant='outlined'
            />
          </Box>
        }
      />
      <CardContent>
        <TableContainer component={Paper} variant='outlined'>
          <Table sx={{ minWidth: 650 }} aria-label='viewport users table'>
            <TableHead>
              <TableRow>
                <TableCell align='center' sx={{ fontWeight: 600 }}>
                  ردیف
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  نام و نام خانوادگی
                </TableCell>
                <TableCell align='center' sx={{ fontWeight: 600 }}>
                  تاریخ عضویت
                </TableCell>
                <TableCell align='center' sx={{ fontWeight: 600 }}>
                  تعداد زیرمجموعه
                </TableCell>
                <TableCell align='center' sx={{ fontWeight: 600 }}>
                  سرمایه (TWIN)
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align='center' sx={{ py: 8 }}>
                    <Typography variant='body2' color='text.secondary'>
                      هیچ کاربری در محدوده نمایش نقشه یافت نشد
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user, index) => (
                  <TableRow
                    key={user.id}
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                  >
                    <TableCell align='center' component='th' scope='row'>
                      {page * rowsPerPage + index + 1}
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' sx={{ fontWeight: 500 }}>
                        {user.fullName}
                      </Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <Typography variant='body2' color='text.secondary'>
                        {formatDate(user.joinDate)}
                      </Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <Chip
                        label={formatNumber(user.subordinates)}
                        size='small'
                        color={user.subordinates > 20 ? 'success' : user.subordinates > 10 ? 'info' : 'default'}
                        sx={{ minWidth: 60 }}
                      />
                    </TableCell>
                    <TableCell align='center'>
                      <Typography 
                        variant='body2' 
                        sx={{ 
                          fontWeight: 600,
                          color: user.capital > 50000 ? 'success.main' : user.capital > 20000 ? 'info.main' : 'text.primary'
                        }}
                      >
                        {formatNumber(user.capital)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {visibleUsers.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component='div'
            count={visibleUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage='تعداد در هر صفحه:'
            labelDisplayedRows={({ from, to, count }) => 
              `${formatNumber(from)}-${formatNumber(to)} از ${formatNumber(count)}`
            }
            sx={{
              '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                fontFamily: 'inherit'
              }
            }}
          />
        )}
      </CardContent>
    </Card>
  )
}

export default ViewportUsersTable


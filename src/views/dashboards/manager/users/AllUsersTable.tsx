'use client'

// ** React Imports
import { useState, useMemo, useEffect } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Component Imports
import UserDetailsModal from './UserDetailsModal'

// ** Types
export interface User {
  id: number
  fullName: string
  email: string
  phone: string
  joinDate: string
  status: 'active' | 'inactive' | 'suspended'
  subordinates: number
  capital: number
  subordinatesCapital: number
}

interface AllUsersTableProps {
  users: User[]
}

const AllUsersTable = ({ users }: AllUsersTableProps) => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // ** Handle modal
  const handleOpenModal = (user: User) => {
    setSelectedUser(user)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedUser(null)
  }

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

  // ** Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'فعال'
      case 'inactive':
        return 'غیرفعال'
      case 'suspended':
        return 'معلق'
      default:
        return status
    }
  }

  // ** Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'inactive':
        return 'default'
      case 'suspended':
        return 'error'
      default:
        return 'default'
    }
  }

  // ** Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // ** Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) {
      return users
    }

    const searchLower = searchTerm.toLowerCase().trim()
    return users.filter(user => {
      // Search in full name
      if (user.fullName.toLowerCase().includes(searchLower)) return true
      
      // Search in email
      if (user.email.toLowerCase().includes(searchLower)) return true
      
      // Search in phone
      if (user.phone.includes(searchTerm)) return true
      
      // Search in status (Persian)
      const statusLabel = getStatusLabel(user.status)
      if (statusLabel.includes(searchLower)) return true
      
      // Search in subordinates (number)
      if (user.subordinates.toString().includes(searchTerm)) return true
      
      // Search in capital (number)
      if (user.capital.toString().includes(searchTerm)) return true
      
      // Search in formatted date
      const formattedDate = formatDate(user.joinDate)
      if (formattedDate.includes(searchLower)) return true
      
      return false
    })
  }, [users, searchTerm])

  // ** Reset page when search changes
  useEffect(() => {
    setPage(0)
  }, [searchTerm])

  // ** Paginated users
  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  }, [filteredUsers, page, rowsPerPage])

  return (
    <Card>
      <CardHeader
        title='لیست تمام کاربران'
        titleTypographyProps={{ 
          variant: 'h6', 
          sx: { letterSpacing: '0.15px', fontWeight: 600 } 
        }}
        subheader={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
            <Typography variant='body2' color='text.secondary'>
              {searchTerm ? (
                <>
                  {formatNumber(filteredUsers.length)} نتیجه از {formatNumber(users.length)} کاربر
                </>
              ) : (
                <>مجموع {formatNumber(users.length)} کاربر</>
              )}
            </Typography>
          </Box>
        }
      />
      <CardContent>
        {/* Search Field */}
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            size='small'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder='جستجو بر اساس نام، ایمیل، شماره تماس، وضعیت، سرمایه و...'
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <Icon icon='mdi:magnify' fontSize={20} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position='end'>
                  <IconButton
                    size='small'
                    onClick={() => setSearchTerm('')}
                    sx={{ color: 'text.secondary' }}
                  >
                    <Icon icon='mdi:close' fontSize={20} />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiInputBase-root': {
                borderRadius: 1
              }
            }}
          />
        </Box>
        <TableContainer component={Paper} variant='outlined'>
          <Table sx={{ minWidth: 650 }} aria-label='all users table'>
            <TableHead>
              <TableRow>
                <TableCell align='center'>ردیف</TableCell>
                <TableCell>نام و نام خانوادگی</TableCell>
                <TableCell>ایمیل</TableCell>
                <TableCell>شماره تماس</TableCell>
                <TableCell align='center'>تاریخ عضویت</TableCell>
                <TableCell align='center'>وضعیت</TableCell>
                <TableCell align='center'>زیرمجموعه</TableCell>
                <TableCell align='center'>سرمایه (TWIN)</TableCell>
                <TableCell align='center'>عملیات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align='center' sx={{ py: 8 }}>
                    <Typography variant='body2' color='text.secondary'>
                      هیچ کاربری یافت نشد
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
                    <TableCell>
                      <Typography variant='body2' color='text.secondary'>
                        {user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' color='text.secondary'>
                        {user.phone}
                      </Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <Typography variant='body2' color='text.secondary'>
                        {formatDate(user.joinDate)}
                      </Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <Chip
                        label={getStatusLabel(user.status)}
                        size='small'
                        color={getStatusColor(user.status)}
                        sx={{ minWidth: 80 }}
                      />
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
                      <Typography variant='body2' sx={{ fontWeight: 500 }}>
                        {formatNumber(user.capital)}
                      </Typography>
                    </TableCell>
                    <TableCell align='center'>
                      <IconButton
                        size='small'
                        onClick={() => handleOpenModal(user)}
                        sx={{ color: 'primary.main' }}
                        title='مشاهده جزئیات'
                      >
                        <Icon icon='mdi:eye-outline' fontSize={20} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component='div'
          count={filteredUsers.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage='تعداد ردیف در صفحه:'
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} از ${count}`}
        />
      </CardContent>
      
      {/* User Details Modal */}
      <UserDetailsModal
        open={modalOpen}
        onClose={handleCloseModal}
        user={selectedUser}
      />
    </Card>
  )
}

export default AllUsersTable

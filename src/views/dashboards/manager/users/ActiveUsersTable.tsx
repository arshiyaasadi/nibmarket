'use client'

// ** React Imports
import { useState, useMemo } from 'react'

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
import TableSortLabel from '@mui/material/TableSortLabel'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Component Imports
import UserDetailsModal from './UserDetailsModal'

// ** Types
export interface ActiveUser {
  id: number
  fullName: string
  email: string
  phone: string
  joinDate: string
  status: 'active'
  subordinates: number
  capital: number
  subordinatesCapital: number
  lastInviteDate: string | null // تاریخ آخرین دعوت
  lastCapitalIncreaseDate: string | null // تاریخ آخرین افزایش سرمایه
  activeSubordinates: number // تعداد زیرمجموعه فعال
}

interface ActiveUsersTableProps {
  users: ActiveUser[]
}

type SortField = 'lastInviteDate' | 'lastCapitalIncreaseDate' | 'capital' | 'activeSubordinates' | 'fullName'
type SortOrder = 'asc' | 'desc'

const ActiveUsersTable = ({ users }: ActiveUsersTableProps) => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortField, setSortField] = useState<SortField>('lastInviteDate')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [selectedUser, setSelectedUser] = useState<ActiveUser | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // ** Handle modal
  const handleOpenModal = (user: ActiveUser) => {
    setSelectedUser(user)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedUser(null)
  }

  // ** Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // ** Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  // ** Format date to Persian
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'ندارد'
    const date = new Date(dateString)
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // ** Format number to Persian
  const formatNumber = (num: number): string => {
    return num.toLocaleString('fa-IR')
  }

  // ** Format relative time (e.g., "2 روز پیش")
  const formatRelativeTime = (dateString: string | null): string => {
    if (!dateString) return 'ندارد'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'امروز'
    if (diffDays === 1) return 'دیروز'
    if (diffDays < 7) return `${diffDays} روز پیش`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} هفته پیش`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} ماه پیش`
    return `${Math.floor(diffDays / 365)} سال پیش`
  }

  // ** Sort users
  const sortedUsers = useMemo(() => {
    const sorted = [...users].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case 'lastInviteDate':
          aValue = a.lastInviteDate ? new Date(a.lastInviteDate).getTime() : 0
          bValue = b.lastInviteDate ? new Date(b.lastInviteDate).getTime() : 0
          break
        case 'lastCapitalIncreaseDate':
          aValue = a.lastCapitalIncreaseDate ? new Date(a.lastCapitalIncreaseDate).getTime() : 0
          bValue = b.lastCapitalIncreaseDate ? new Date(b.lastCapitalIncreaseDate).getTime() : 0
          break
        case 'capital':
          aValue = a.capital + a.subordinatesCapital
          bValue = b.capital + b.subordinatesCapital
          break
        case 'activeSubordinates':
          aValue = a.activeSubordinates
          bValue = b.activeSubordinates
          break
        case 'fullName':
          aValue = a.fullName
          bValue = b.fullName
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }, [users, sortField, sortOrder])

  // ** Paginated users
  const paginatedUsers = useMemo(() => {
    return sortedUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  }, [sortedUsers, page, rowsPerPage])

  return (
    <>
      <Card>
        <CardHeader
          title='لیست کاربران فعال'
          titleTypographyProps={{ 
            variant: 'h6', 
            sx: { letterSpacing: '0.15px', fontWeight: 600 } 
          }}
          subheader={
            <Typography variant='body2' color='text.secondary'>
              مجموع {formatNumber(users.length)} کاربر فعال
            </Typography>
          }
        />
        <CardContent>
          <TableContainer component={Paper} variant='outlined'>
            <Table sx={{ minWidth: 800 }} aria-label='active users table'>
              <TableHead>
                <TableRow>
                  <TableCell align='center'>ردیف</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'fullName'}
                      direction={sortField === 'fullName' ? sortOrder : 'asc'}
                      onClick={() => handleSort('fullName')}
                    >
                      نام و نام خانوادگی
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align='center'>ایمیل</TableCell>
                  <TableCell align='center'>
                    <TableSortLabel
                      active={sortField === 'lastInviteDate'}
                      direction={sortField === 'lastInviteDate' ? sortOrder : 'desc'}
                      onClick={() => handleSort('lastInviteDate')}
                    >
                      آخرین دعوت
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align='center'>
                    <TableSortLabel
                      active={sortField === 'lastCapitalIncreaseDate'}
                      direction={sortField === 'lastCapitalIncreaseDate' ? sortOrder : 'desc'}
                      onClick={() => handleSort('lastCapitalIncreaseDate')}
                    >
                      آخرین افزایش سرمایه
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align='center'>
                    <TableSortLabel
                      active={sortField === 'capital'}
                      direction={sortField === 'capital' ? sortOrder : 'desc'}
                      onClick={() => handleSort('capital')}
                    >
                      مجموع سرمایه
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align='center'>
                    <TableSortLabel
                      active={sortField === 'activeSubordinates'}
                      direction={sortField === 'activeSubordinates' ? sortOrder : 'desc'}
                      onClick={() => handleSort('activeSubordinates')}
                    >
                      زیرمجموعه فعال
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align='center'>عملیات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align='center' sx={{ py: 8 }}>
                      <Typography variant='body2' color='text.secondary'>
                        هیچ کاربر فعالی یافت نشد
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user, index) => {
                    const totalCapital = user.capital + user.subordinatesCapital
                    return (
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
                            {user.email}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Box>
                            <Typography variant='body2' sx={{ fontWeight: 500 }}>
                              {formatRelativeTime(user.lastInviteDate)}
                            </Typography>
                            {user.lastInviteDate && (
                              <Typography variant='caption' color='text.secondary' display='block'>
                                {formatDate(user.lastInviteDate)}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align='center'>
                          <Box>
                            <Typography variant='body2' sx={{ fontWeight: 500 }}>
                              {formatRelativeTime(user.lastCapitalIncreaseDate)}
                            </Typography>
                            {user.lastCapitalIncreaseDate && (
                              <Typography variant='caption' color='text.secondary' display='block'>
                                {formatDate(user.lastCapitalIncreaseDate)}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align='center'>
                          <Typography variant='body2' sx={{ fontWeight: 600, color: 'success.main' }}>
                            {formatNumber(totalCapital)} TWIN
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          <Chip
                            label={`${formatNumber(user.activeSubordinates)} / ${formatNumber(user.subordinates)}`}
                            size='small'
                            color={user.activeSubordinates > user.subordinates * 0.7 ? 'success' : user.activeSubordinates > user.subordinates * 0.4 ? 'info' : 'default'}
                            sx={{ minWidth: 80 }}
                          />
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
                    )
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component='div'
            count={sortedUsers.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage='تعداد ردیف در صفحه:'
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} از ${count}`}
          />
        </CardContent>
      </Card>

      {/* User Details Modal */}
      <UserDetailsModal
        open={modalOpen}
        onClose={handleCloseModal}
        user={selectedUser}
      />
    </>
  )
}

export default ActiveUsersTable

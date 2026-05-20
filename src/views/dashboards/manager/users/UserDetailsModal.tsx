'use client'

// ** React Imports
import { useState, useMemo } from 'react'

// ** MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'

// ** Custom Components Imports
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Types
import { User } from './AllUsersTable'
import { ActiveUser } from './ActiveUsersTable'

interface UserDetailsModalProps {
  open: boolean
  onClose: () => void
  user: User | ActiveUser | null
}

// Mock data for subordinates - in real app, this would come from API
const generateMockSubordinates = (userId: number, count: number) => {
  const firstNames = ['علی', 'محمد', 'حسین', 'رضا', 'امیر', 'سعید', 'مهدی', 'احمد', 'حسن', 'فرهاد']
  const lastNames = ['احمدی', 'رضایی', 'کریمی', 'موسوی', 'نوری', 'حسینی', 'محمدی', 'صادقی', 'جعفری', 'زمانی']
  
  const subordinates = []
  for (let i = 1; i <= count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    
    subordinates.push({
      id: userId * 1000 + i,
      fullName: `${firstName} ${lastName}`,
      email: `sub${userId}_${i}@example.com`,
      joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      capital: Math.floor(Math.random() * 50000) + 1000,
      subordinates: Math.floor(Math.random() * 20)
    })
  }
  
  return subordinates
}

const UserDetailsModal = ({ open, onClose, user }: UserDetailsModalProps) => {
  // Generate mock subordinates
  const subordinates = useMemo(() => {
    if (!user) return []
    return generateMockSubordinates(user.id, user.subordinates)
  }, [user])

  // Calculate total subordinates capital
  const totalSubordinatesCapital = useMemo(() => {
    return subordinates.reduce((sum, sub) => sum + sub.capital, 0)
  }, [subordinates])

  // Format date to Persian
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Format number to Persian
  const formatNumber = (num: number): string => {
    return num.toLocaleString('fa-IR')
  }

  // Get status color
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

  // Get status label
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

  if (!user) return null

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={onClose}
      maxWidth='md'
      scroll='body'
      sx={{
        '& .MuiPaper-root': {
          width: '100%',
          maxWidth: 900
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 3
        }}
      >
        <Typography variant='h5' sx={{ fontWeight: 600 }}>
          جزئیات کاربر
        </Typography>
        <IconButton
          size='small'
          onClick={onClose}
          sx={{ color: 'text.secondary' }}
        >
          <Icon icon='mdi:close' />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 0 }}>
        <Grid container spacing={4}>
          {/* User Info Card */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                  <CustomAvatar
                    skin='light'
                    variant='rounded'
                    color='primary'
                    sx={{ width: 80, height: 80, fontSize: '2rem' }}
                  >
                    {user.fullName.split(' ').map(n => n[0]).join('')}
                  </CustomAvatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='h5' sx={{ mb: 1, fontWeight: 600 }}>
                      {user.fullName}
                    </Typography>
                    <Chip
                      label={getStatusLabel(user.status)}
                      size='small'
                      color={getStatusColor(user.status)}
                      sx={{ minWidth: 80 }}
                    />
                  </Box>
                </Box>
                <Divider sx={{ my: 3 }} />
                <Grid container spacing={4}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant='caption' color='text.secondary' display='block' sx={{ mb: 1 }}>
                        ایمیل
                      </Typography>
                      <Typography variant='body1'>{user.email}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant='caption' color='text.secondary' display='block' sx={{ mb: 1 }}>
                        شماره تماس
                      </Typography>
                      <Typography variant='body1'>{user.phone}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant='caption' color='text.secondary' display='block' sx={{ mb: 1 }}>
                        تاریخ عضویت
                      </Typography>
                      <Typography variant='body1'>{formatDate(user.joinDate)}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant='caption' color='text.secondary' display='block' sx={{ mb: 1 }}>
                        تعداد زیرمجموعه
                      </Typography>
                      <Typography variant='body1' sx={{ fontWeight: 600 }}>
                        {formatNumber(user.subordinates)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Capital Info Cards */}
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <CustomAvatar skin='light' variant='rounded' color='primary' sx={{ width: 48, height: 48 }}>
                    <Icon icon='mdi:wallet-outline' fontSize={24} />
                  </CustomAvatar>
                  <Box>
                    <Typography variant='caption' color='text.secondary' display='block'>
                      سرمایه کاربر
                    </Typography>
                    <Typography variant='h6' sx={{ fontWeight: 600 }}>
                      {formatNumber(user.capital)} TWIN
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <CustomAvatar skin='light' variant='rounded' color='info' sx={{ width: 48, height: 48 }}>
                    <Icon icon='mdi:account-group-outline' fontSize={24} />
                  </CustomAvatar>
                  <Box>
                    <Typography variant='caption' color='text.secondary' display='block'>
                      سرمایه زیرمجموعه‌ها
                    </Typography>
                    <Typography variant='h6' sx={{ fontWeight: 600 }}>
                      {formatNumber(totalSubordinatesCapital)} TWIN
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <CustomAvatar skin='light' variant='rounded' color='success' sx={{ width: 48, height: 48 }}>
                    <Icon icon='mdi:chart-line' fontSize={24} />
                  </CustomAvatar>
                  <Box>
                    <Typography variant='caption' color='text.secondary' display='block'>
                      مجموع سرمایه
                    </Typography>
                    <Typography variant='h6' sx={{ fontWeight: 600 }}>
                      {formatNumber(user.capital + totalSubordinatesCapital)} TWIN
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Subordinates Table */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>
                  لیست زیرمجموعه‌ها ({formatNumber(subordinates.length)})
                </Typography>
                {subordinates.length === 0 ? (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography variant='body2' color='text.secondary'>
                      هیچ زیرمجموعه‌ای وجود ندارد
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer component={Paper} variant='outlined'>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>نام و نام خانوادگی</TableCell>
                          <TableCell>ایمیل</TableCell>
                          <TableCell align='center'>تاریخ عضویت</TableCell>
                          <TableCell align='center'>سرمایه (TWIN)</TableCell>
                          <TableCell align='center'>زیرمجموعه</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {subordinates.map((sub) => (
                          <TableRow key={sub.id}>
                            <TableCell>
                              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                                {sub.fullName}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant='body2' color='text.secondary'>
                                {sub.email}
                              </Typography>
                            </TableCell>
                            <TableCell align='center'>
                              <Typography variant='body2' color='text.secondary'>
                                {formatDate(sub.joinDate)}
                              </Typography>
                            </TableCell>
                            <TableCell align='center'>
                              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                                {formatNumber(sub.capital)}
                              </Typography>
                            </TableCell>
                            <TableCell align='center'>
                              <Chip
                                label={formatNumber(sub.subordinates)}
                                size='small'
                                color={sub.subordinates > 10 ? 'info' : 'default'}
                                sx={{ minWidth: 60 }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  )
}

export default UserDetailsModal

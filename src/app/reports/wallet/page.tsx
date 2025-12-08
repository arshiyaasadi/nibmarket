'use client'

// ** React Imports
import { Suspense, useMemo, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import Chip from '@mui/material/Chip'


// ** Types
interface WalletTransaction {
  id: string
  date: string
  type: 'واریز' | 'برداشت'
  description: string
}

const WalletReportsPageContent = () => {
  // ** States
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [transactionType, setTransactionType] = useState<string>('all')

  // ** Sample data - replace with your actual data source
  const allTransactions: WalletTransaction[] = useMemo(
    () => [
      {
        id: '1',
        date: '۱۴۰۴/۱۲/۰۶',
        type: 'واریز',
        description: 'واریز ۱۰ توکن بابت ورود به سامانه'
      },
      {
        id: '2',
        date: '۱۴۰۴/۱۲/۰۵',
        type: 'برداشت',
        description: 'برداشت ۵ توکن برای خرید پکیج'
      },
      {
        id: '3',
        date: '۱۴۰۴/۱۲/۰۴',
        type: 'واریز',
        description: 'واریز ۲۰ توکن بابت دعوت دوستان'
      },
      {
        id: '4',
        date: '۱۴۰۴/۱۲/۰۳',
        type: 'واریز',
        description: 'واریز ۱۵ توکن بابت تکمیل ماموریت'
      },
      {
        id: '5',
        date: '۱۴۰۴/۱۲/۰۲',
        type: 'برداشت',
        description: 'برداشت ۸ توکن برای ارتقای حساب'
      }
    ],
    []
  )

  // ** Helper function to format date input automatically
  const formatDateInput = (value: string): string => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '')
    
    // Limit to 8 digits (YYYYMMDD)
    const limitedDigits = digits.slice(0, 8)
    
    // Add slashes automatically
    if (limitedDigits.length <= 4) {
      return limitedDigits
    } else if (limitedDigits.length <= 6) {
      return `${limitedDigits.slice(0, 4)}/${limitedDigits.slice(4)}`
    } else {
      return `${limitedDigits.slice(0, 4)}/${limitedDigits.slice(4, 6)}/${limitedDigits.slice(6, 8)}`
    }
  }

  // ** Helper function to convert date string to Date object for comparison
  const dateStringToDate = (dateString: string): Date | null => {
    if (!dateString || dateString.length !== 10) return null
    
    const parts = dateString.split('/')
    if (parts.length !== 3) return null
    
    const year = parseInt(parts[0])
    const month = parseInt(parts[1])
    const day = parseInt(parts[2])
    
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null
    if (month < 1 || month > 12 || day < 1 || day > 31) return null
    
    try {
      return new Date(year, month - 1, day)
    } catch {
      return null
    }
  }

  // ** Filter transactions based on filters
  const transactions = useMemo(() => {
    let filtered = [...allTransactions]

    // Filter by transaction type
    if (transactionType !== 'all') {
      filtered = filtered.filter(t => t.type === transactionType)
    }

    // Filter by date range
    if (startDate || endDate) {
      const startDateObj = startDate ? dateStringToDate(startDate) : null
      const endDateObj = endDate ? dateStringToDate(endDate) : null
      
      filtered = filtered.filter(t => {
        // Convert Persian date to comparable format
        // For now, we'll do a simple string comparison
        // In production, convert Persian dates properly
        const transactionDateStr = t.date
        
        if (startDateObj) {
          // Simple comparison - in production, convert Persian date properly
          // For now, we'll skip date filtering if dates are in Persian format
          // You should implement proper Persian to Gregorian conversion
        }
        
        if (endDateObj) {
          // Simple comparison - in production, convert Persian date properly
        }

        return true
      })
    }

    return filtered
  }, [allTransactions, startDate, endDate, transactionType])

  // ** Handlers
  const handleTransactionTypeChange = (event: SelectChangeEvent) => {
    setTransactionType(event.target.value)
  }

  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDateInput(event.target.value)
    setStartDate(formatted)
  }

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDateInput(event.target.value)
    setEndDate(formatted)
  }

  const handleResetFilters = () => {
    setStartDate('')
    setEndDate('')
    setTransactionType('all')
  }

  // ** Columns definition
  const columns: GridColDef[] = [
    {
      flex: 0.2,
      minWidth: 150,
      field: 'date',
      headerName: 'تاریخ',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {params.row.date}
          </Typography>
        </Box>
      )
    },
    {
      flex: 0.15,
      minWidth: 120,
      field: 'type',
      headerName: 'نوع',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => {
        const isDeposit = params.row.type === 'واریز'
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
            <Chip
              label={params.row.type}
              color={isDeposit ? 'success' : 'error'}
              size='small'
              sx={{ fontWeight: 500 }}
            />
          </Box>
        )
      }
    },
    {
      flex: 0.65,
      minWidth: 300,
      field: 'description',
      headerName: 'شرح',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {params.row.description}
          </Typography>
        </Box>
      )
    }
  ]

  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 4 }}>
        گزارش کیف پول
      </Typography>

      {/* Filter Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: theme => `${theme.spacing(5)} !important` }}>
          <Typography variant='h6' sx={{ mb: 4, fontWeight: 600 }}>
            فیلتر تراکنش‌ها
          </Typography>
          <Grid container spacing={3}>
            {/* Date Range Filters */}
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <InputLabel sx={{ mb: 1.5, fontSize: '0.875rem', fontWeight: 500, color: 'text.primary' }}>
                  از تاریخ
                </InputLabel>
                <TextField
                  type='text'
                  id='start-date-input'
                  value={startDate}
                  onChange={handleStartDateChange}
                  placeholder='yyyy/mm/dd'
                  fullWidth
                  inputProps={{
                    maxLength: 10,
                    pattern: '[0-9/]*'
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <InputLabel sx={{ mb: 1.5, fontSize: '0.875rem', fontWeight: 500, color: 'text.primary' }}>
                  تا تاریخ
                </InputLabel>
                <TextField
                  type='text'
                  id='end-date-input'
                  value={endDate}
                  onChange={handleEndDateChange}
                  placeholder='yyyy/mm/dd'
                  fullWidth
                  inputProps={{
                    maxLength: 10,
                    pattern: '[0-9/]*'
                  }}
                />
              </Box>
            </Grid>
            {/* Transaction Type Filter */}
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
                <FormControl fullWidth>
                  <InputLabel id='transaction-type-select-label'>نوع تراکنش</InputLabel>
                  <Select
                    labelId='transaction-type-select-label'
                    id='transaction-type-select'
                    value={transactionType}
                    label='نوع تراکنش'
                    onChange={handleTransactionTypeChange}
                  >
                    <MenuItem value='all'>همه</MenuItem>
                    <MenuItem value='واریز'>واریز</MenuItem>
                    <MenuItem value='برداشت'>برداشت</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            {/* Reset Button */}
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
                <Button 
                  variant='outlined' 
                  fullWidth 
                  onClick={handleResetFilters}
                  sx={{ 
                    height: '56px',
                    textTransform: 'none',
                    fontSize: '1rem'
                  }}
                >
                  پاک کردن فیلترها
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent sx={{ p: theme => `${theme.spacing(5)} !important` }}>
          <Box sx={{ height: 500, width: '100%' }}>
            <DataGrid
              rows={transactions}
              columns={columns}
              disableRowSelectionOnClick
              hideFooter
              sx={{
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: 'action.hover'
                },
                '& .MuiDataGrid-cell': {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                },
                '& .MuiDataGrid-columnHeader': {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

const WalletReportsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WalletReportsPageContent />
    </Suspense>
  )
}

export default WalletReportsPage


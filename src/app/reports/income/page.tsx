'use client'

// ** React Imports
import { Suspense, useMemo, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import Chip from '@mui/material/Chip'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Types
interface IncomeTransaction {
  id: string
  date: string
  type: 'فعالیت در سامانه' | 'توسعه شبکه' | 'پورسانت'
  description: string
}

const IncomeReportsPageContent = () => {
  // ** States
  const [selectedYear, setSelectedYear] = useState<string>('')
  const [selectedMonth, setSelectedMonth] = useState<string>('')

  // ** Get current year (Persian calendar - 1404)
  const currentYear = 1404
  const years = Array.from({ length: 11 }, (_, i) => currentYear - i)

  // ** Persian months
  const persianMonths = [
    { value: '1', label: 'فروردین' },
    { value: '2', label: 'اردیبهشت' },
    { value: '3', label: 'خرداد' },
    { value: '4', label: 'تیر' },
    { value: '5', label: 'مرداد' },
    { value: '6', label: 'شهریور' },
    { value: '7', label: 'مهر' },
    { value: '8', label: 'آبان' },
    { value: '9', label: 'آذر' },
    { value: '10', label: 'دی' },
    { value: '11', label: 'بهمن' },
    { value: '12', label: 'اسفند' }
  ]

  // ** Sample data - replace with your actual data source
  const transactions: IncomeTransaction[] = useMemo(
    () => [
      {
        id: '1',
        date: '۱۴۰۴/۱۲/۰۶',
        type: 'فعالیت در سامانه',
        description: 'درآمد ۱۰ توکن بابت فعالیت در سامانه'
      },
      {
        id: '2',
        date: '۱۴۰۴/۱۲/۰۵',
        type: 'توسعه شبکه',
        description: 'درآمد ۵ توکن بابت توسعه شبکه'
      },
      {
        id: '3',
        date: '۱۴۰۴/۱۲/۰۴',
        type: 'پورسانت',
        description: 'درآمد ۲۰ توکن بابت پورسانت'
      },
      {
        id: '4',
        date: '۱۴۰۴/۱۲/۰۳',
        type: 'فعالیت در سامانه',
        description: 'درآمد ۱۵ توکن بابت فعالیت در سامانه'
      },
      {
        id: '5',
        date: '۱۴۰۴/۱۲/۰۲',
        type: 'توسعه شبکه',
        description: 'درآمد ۸ توکن بابت توسعه شبکه'
      }
    ],
    []
  )

  // ** Handle filter changes
  const handleYearChange = (event: SelectChangeEvent) => {
    setSelectedYear(event.target.value)
  }

  const handleMonthChange = (event: SelectChangeEvent) => {
    setSelectedMonth(event.target.value)
  }

  const handleSearch = () => {
    // Filter logic here - replace with your actual filtering logic
    console.log('Searching for:', { year: selectedYear, month: selectedMonth })
  }

  // ** Get chip color based on type
  const getChipColor = (type: string) => {
    switch (type) {
      case 'فعالیت در سامانه':
        return 'primary'
      case 'توسعه شبکه':
        return 'success'
      case 'پورسانت':
        return 'warning'
      default:
        return 'default'
    }
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
      flex: 0.25,
      minWidth: 180,
      field: 'type',
      headerName: 'نوع',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
          <Chip
            label={params.row.type}
            color={getChipColor(params.row.type) as any}
            size='small'
            sx={{ fontWeight: 500 }}
          />
        </Box>
      )
    },
    {
      flex: 0.55,
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
        گزارش درامد ها
      </Typography>
      <Card>
        <CardContent sx={{ p: theme => `${theme.spacing(5)} !important` }}>
          {/* Filter Section */}
          <Box
            sx={{
              mb: 4,
              display: 'flex',
              gap: 3,
              flexWrap: 'wrap',
              alignItems: 'flex-end',
              justifyContent: 'flex-end',
              direction: 'rtl'
            }}
          >
            <Button
              variant='contained'
              size='medium'
              onClick={handleSearch}
              startIcon={<Icon icon='mdi:magnify' />}
              sx={{
                minWidth: '140px',
                height: '40px',
                px: 3,
                fontWeight: 500
              }}
            >
              جستجو
            </Button>
            <FormControl sx={{ minWidth: 150 }} size='small'>
              <InputLabel id='year-select-label'>سال</InputLabel>
              <Select
                labelId='year-select-label'
                id='year-select'
                value={selectedYear}
                label='سال'
                onChange={handleYearChange}
                sx={{ direction: 'rtl' }}
              >
                {years.map(year => (
                  <MenuItem key={year} value={year.toString()}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl sx={{ minWidth: 150 }} size='small'>
              <InputLabel id='month-select-label'>ماه</InputLabel>
              <Select
                labelId='month-select-label'
                id='month-select'
                value={selectedMonth}
                label='ماه'
                onChange={handleMonthChange}
                sx={{ direction: 'rtl' }}
              >
                {persianMonths.map(month => (
                  <MenuItem key={month.value} value={month.value}>
                    {month.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Table Section */}
          <Box sx={{ height: 500, width: '100%' }}>
            <DataGrid
              rows={transactions}
              columns={columns}
              disableRowSelectionOnClick
              hideFooter
              sx={{
                direction: 'rtl',
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

const IncomeReportsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <IncomeReportsPageContent />
    </Suspense>
  )
}

export default IncomeReportsPage


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

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Types
interface SubsetReport {
  id: string
  rowNumber: number
  fullName: string
  joinDate: string
  level: number
  lastMonthAvgInvestment: number
  lastMonthReward: number
  currentMonthAvgInvestment: number
  totalReward: number
}

const SubsetsReportsPageContent = () => {
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
  const subsetReports: SubsetReport[] = useMemo(
    () => [
      {
        id: '1',
        rowNumber: 1,
        fullName: 'علی احمدی',
        joinDate: '۱۴۰۳/۰۱/۱۵',
        level: 5,
        lastMonthAvgInvestment: 5000000,
        lastMonthReward: 250000,
        currentMonthAvgInvestment: 6000000,
        totalReward: 1200000
      },
      {
        id: '2',
        rowNumber: 2,
        fullName: 'سارا محمدی',
        joinDate: '۱۴۰۳/۰۲/۱۰',
        level: 7,
        lastMonthAvgInvestment: 8000000,
        lastMonthReward: 400000,
        currentMonthAvgInvestment: 9000000,
        totalReward: 2000000
      },
      {
        id: '3',
        rowNumber: 3,
        fullName: 'رضا کریمی',
        joinDate: '۱۴۰۳/۰۳/۰۵',
        level: 4,
        lastMonthAvgInvestment: 3000000,
        lastMonthReward: 150000,
        currentMonthAvgInvestment: 3500000,
        totalReward: 800000
      },
      {
        id: '4',
        rowNumber: 4,
        fullName: 'زهرا رضایی',
        joinDate: '۱۴۰۳/۰۴/۱۲',
        level: 6,
        lastMonthAvgInvestment: 7000000,
        lastMonthReward: 350000,
        currentMonthAvgInvestment: 7500000,
        totalReward: 1500000
      },
      {
        id: '5',
        rowNumber: 5,
        fullName: 'محمد حسینی',
        joinDate: '۱۴۰۳/۰۵/۲۰',
        level: 3,
        lastMonthAvgInvestment: 2000000,
        lastMonthReward: 100000,
        currentMonthAvgInvestment: 2500000,
        totalReward: 500000
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

  // ** Format number with Persian locale
  const formatNumber = (num: number) => {
    return num.toLocaleString('fa-IR')
  }

  // ** Columns definition
  const columns: GridColDef[] = [
    {
      flex: 0.12,
      minWidth: 160,
      field: 'totalReward',
      headerName: 'کل پاداش حاصله',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
          <Typography variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
            {formatNumber(params.row.totalReward)} تومان
          </Typography>
        </Box>
      )
    },
    {
      flex: 0.15,
      minWidth: 200,
      field: 'currentMonthAvgInvestment',
      headerName: 'میانگین سرمایه گذاری ماه جاری',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {formatNumber(params.row.currentMonthAvgInvestment)} تومان
          </Typography>
        </Box>
      )
    },
    {
      flex: 0.12,
      minWidth: 160,
      field: 'lastMonthReward',
      headerName: 'پاداش حاصله ماه آخر',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
          <Typography variant='body2' sx={{ color: 'text.primary', fontWeight: 500 }}>
            {formatNumber(params.row.lastMonthReward)} تومان
          </Typography>
        </Box>
      )
    },
    {
      flex: 0.15,
      minWidth: 200,
      field: 'lastMonthAvgInvestment',
      headerName: 'میانگین سرمایه گذاری ماه آخر',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {formatNumber(params.row.lastMonthAvgInvestment)} تومان
          </Typography>
        </Box>
      )
    },
    {
      flex: 0.08,
      minWidth: 100,
      field: 'level',
      headerName: 'سطح',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {params.row.level}
          </Typography>
        </Box>
      )
    },
    {
      flex: 0.12,
      minWidth: 140,
      field: 'joinDate',
      headerName: 'تاریخ عضویت',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
          <Typography variant='body2' sx={{ color: 'text.primary' }}>
            {params.row.joinDate}
          </Typography>
        </Box>
      )
    },
    {
      flex: 0.15,
      minWidth: 180,
      field: 'fullName',
      headerName: 'نام و نام خانوادگی',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
          <Typography variant='body2' sx={{ color: 'text.primary', fontWeight: 500 }}>
            {params.row.fullName}
          </Typography>
        </Box>
      )
    },
    {
      flex: 0.08,
      minWidth: 80,
      field: 'rowNumber',
      headerName: 'ردیف',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
          <Typography variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
            {params.row.rowNumber}
          </Typography>
        </Box>
      )
    }
  ]

  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 4 }}>
        گزارش زیر مجموعه ها
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
              rows={subsetReports}
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

const SubsetsReportsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SubsetsReportsPageContent />
    </Suspense>
  )
}

export default SubsetsReportsPage


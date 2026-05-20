'use client'

// ** React Imports
import { Suspense, useState } from 'react'

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

// ** Components
import DashboardWidgetState from 'src/components/dashboard/DashboardWidgetState'

// ** Hooks
import { useReportsSubsets } from 'src/hooks/reports/useReportsSubsets'

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

  const { data, loading, retrying, error, hasData, usedFallback, refetch } = useReportsSubsets(
    selectedYear,
    selectedMonth
  )
  const subsetReports = data.rows

  // ** Handle filter changes
  const handleYearChange = (event: SelectChangeEvent) => {
    setSelectedYear(event.target.value)
  }

  const handleMonthChange = (event: SelectChangeEvent) => {
    setSelectedMonth(event.target.value)
  }

  const handleSearch = () => {
    refetch()
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
        <DashboardWidgetState
          loading={loading}
          retrying={retrying}
          error={error}
          usedFallback={usedFallback}
          onRetry={refetch}
          skeletonHeight={500}
          widgetTitle='گزارش زیرمجموعه‌ها'
        >
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
          <Box sx={{ height: 500, width: '100%', opacity: hasData ? 1 : 0.5 }}>
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
        </DashboardWidgetState>
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


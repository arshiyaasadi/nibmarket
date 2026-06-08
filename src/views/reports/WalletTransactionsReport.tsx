'use client'

import { useMemo } from 'react'

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

import DashboardWidgetState from 'src/components/dashboard/DashboardWidgetState'
import type { WalletTransaction } from 'src/types/api/reports'

function formatDateInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)

  if (digits.length <= 4) return digits
  if (digits.length <= 6) return `${digits.slice(0, 4)}/${digits.slice(4)}`

  return `${digits.slice(0, 4)}/${digits.slice(4, 6)}/${digits.slice(6, 8)}`
}

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
          <Chip label={params.row.type} color={isDeposit ? 'success' : 'error'} size='small' sx={{ fontWeight: 500 }} />
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

export type WalletTransactionsReportProps = {
  pageTitle: string
  widgetTitle: string
  rows: WalletTransaction[]
  startDate: string
  endDate: string
  transactionType: string
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
  onTransactionTypeChange: (value: string) => void
  onResetFilters: () => void
  filterOnClient: boolean
  loading: boolean
  retrying: boolean
  error: string | null
  hasData: boolean
  usedFallback: boolean
  onRetry: () => void
}

const WalletTransactionsReport = ({
  pageTitle,
  widgetTitle,
  rows,
  startDate,
  endDate,
  transactionType,
  onStartDateChange,
  onEndDateChange,
  onTransactionTypeChange,
  onResetFilters,
  filterOnClient,
  loading,
  retrying,
  error,
  hasData,
  usedFallback,
  onRetry
}: WalletTransactionsReportProps) => {
  const transactions = useMemo(() => {
    if (!filterOnClient) return rows
    if (transactionType === 'all') return rows

    return rows.filter(row => row.type === transactionType)
  }, [rows, transactionType, filterOnClient])

  const handleTransactionTypeChange = (event: SelectChangeEvent) => {
    onTransactionTypeChange(event.target.value)
  }

  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 4 }}>
        {pageTitle}
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: theme => `${theme.spacing(5)} !important` }}>
          <Typography variant='h6' sx={{ mb: 4, fontWeight: 600 }}>
            فیلتر تراکنش‌ها
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <InputLabel sx={{ mb: 1.5, fontSize: '0.875rem', fontWeight: 500, color: 'text.primary' }}>
                  از تاریخ
                </InputLabel>
                <TextField
                  type='text'
                  value={startDate}
                  onChange={event => onStartDateChange(formatDateInput(event.target.value))}
                  placeholder='yyyy/mm/dd'
                  fullWidth
                  inputProps={{ maxLength: 10, pattern: '[0-9/]*' }}
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
                  value={endDate}
                  onChange={event => onEndDateChange(formatDateInput(event.target.value))}
                  placeholder='yyyy/mm/dd'
                  fullWidth
                  inputProps={{ maxLength: 10, pattern: '[0-9/]*' }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
                <FormControl fullWidth>
                  <InputLabel id='transaction-type-select-label'>نوع تراکنش</InputLabel>
                  <Select
                    labelId='transaction-type-select-label'
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
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
                <Button
                  variant='outlined'
                  fullWidth
                  onClick={onResetFilters}
                  sx={{ height: '56px', textTransform: 'none', fontSize: '1rem' }}
                >
                  پاک کردن فیلترها
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <DashboardWidgetState
          loading={loading}
          retrying={retrying}
          error={error}
          usedFallback={usedFallback}
          onRetry={onRetry}
          skeletonHeight={500}
          widgetTitle={widgetTitle}
        >
          <CardContent sx={{ p: theme => `${theme.spacing(5)} !important` }}>
            <Box sx={{ height: 500, width: '100%', opacity: hasData ? 1 : 0.5 }}>
              <DataGrid
                rows={transactions}
                columns={columns}
                disableRowSelectionOnClick
                hideFooter
                sx={{
                  '& .MuiDataGrid-columnHeaders': { backgroundColor: 'action.hover' },
                  '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center', justifyContent: 'center' },
                  '& .MuiDataGrid-columnHeader': { display: 'flex', alignItems: 'center', justifyContent: 'center' }
                }}
              />
            </Box>
          </CardContent>
        </DashboardWidgetState>
      </Card>
    </Box>
  )
}

export default WalletTransactionsReport

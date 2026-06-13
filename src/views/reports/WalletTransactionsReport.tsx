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
import OutlinedInput from '@mui/material/OutlinedInput'
import Chip from '@mui/material/Chip'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'

import Icon from 'src/@core/components/icon'
import DashboardWidgetState from 'src/components/dashboard/DashboardWidgetState'
import JalaliDateField from 'src/components/forms/JalaliDateField'
import {
  RETENTION_MISSION_IDS,
  RETENTION_MISSIONS,
  WALLET_MISSIONS,
  type WalletMission
} from 'src/configs/wallet-missions'
import type { WalletTransaction } from 'src/types/api/reports'

function TransactionTypeCell({ row }: { row: WalletTransaction }) {
  const isDeposit = row.type === 'واریز'
  const label = row.missionTitle || row.type

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        color: 'text.primary',
        typography: 'body2'
      }}
    >
      <Icon
        icon={isDeposit ? 'mdi:arrow-down' : 'mdi:arrow-up'}
        fontSize={18}
        style={{ flexShrink: 0, opacity: 0.72 }}
      />
      <Typography variant='body2' component='span' sx={{ color: 'text.primary' }}>
        {label}
      </Typography>
    </Box>
  )
}

const columns: GridColDef[] = [
  {
    flex: 0.2,
    minWidth: 150,
    field: 'date',
    headerName: 'تاریخ',
    align: 'center',
    headerAlign: 'center',
    renderCell: (params: GridRenderCellParams<WalletTransaction>) => (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.date}
        </Typography>
      </Box>
    )
  },
  {
    flex: 0.28,
    minWidth: 200,
    field: 'type',
    headerName: 'نوع',
    align: 'center',
    headerAlign: 'center',
    renderCell: (params: GridRenderCellParams<WalletTransaction>) => (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
        <TransactionTypeCell row={params.row} />
      </Box>
    )
  },
  {
    flex: 0.52,
    minWidth: 280,
    field: 'description',
    headerName: 'شرح',
    align: 'center',
    headerAlign: 'center',
    renderCell: (params: GridRenderCellParams<WalletTransaction>) => (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
          {params.row.description}
        </Typography>
      </Box>
    )
  }
]

export type WalletReportMode = 'wallet' | 'retention'

export type WalletTransactionsReportProps = {
  pageTitle: string
  widgetTitle: string
  mode?: WalletReportMode
  rows: WalletTransaction[]
  startDate: string
  endDate: string
  missionType: string
  missionIds: number[]
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
  onMissionTypeChange: (value: string) => void
  onMissionIdsChange: (value: number[]) => void
  onResetFilters: () => void
  filterOnClient: boolean
  loading: boolean
  retrying: boolean
  error: string | null
  hasData: boolean
  usedFallback: boolean
  onRetry: () => void
}

function filterRowsOnClient(
  rows: WalletTransaction[],
  startDate: string,
  endDate: string,
  missionType: string,
  missionIds: number[],
  mode: WalletReportMode
): WalletTransaction[] {
  let filtered = rows

  if (mode === 'retention') {
    filtered = filtered.filter(
      row => row.missionId != null && (RETENTION_MISSION_IDS as readonly number[]).includes(row.missionId)
    )
  }

  if (missionType !== 'all') {
    filtered = filtered.filter(row => row.missionCode === missionType)
  }

  if (missionIds.length > 0) {
    filtered = filtered.filter(row => row.missionId != null && missionIds.includes(row.missionId))
  }

  if (startDate) {
    filtered = filtered.filter(row => row.date >= startDate)
  }

  if (endDate) {
    filtered = filtered.filter(row => row.date <= endDate)
  }

  return filtered
}

const WalletTransactionsReport = ({
  pageTitle,
  widgetTitle,
  mode = 'wallet',
  rows,
  startDate,
  endDate,
  missionType,
  missionIds,
  onStartDateChange,
  onEndDateChange,
  onMissionTypeChange,
  onMissionIdsChange,
  onResetFilters,
  filterOnClient,
  loading,
  retrying,
  error,
  hasData,
  usedFallback,
  onRetry
}: WalletTransactionsReportProps) => {
  const missionOptions: WalletMission[] = mode === 'retention' ? RETENTION_MISSIONS : WALLET_MISSIONS

  const transactions = useMemo(() => {
    if (!filterOnClient) return rows

    return filterRowsOnClient(rows, startDate, endDate, missionType, missionIds, mode)
  }, [rows, startDate, endDate, missionType, missionIds, filterOnClient, mode])

  const handleMissionTypeChange = (event: SelectChangeEvent) => {
    onMissionTypeChange(event.target.value)
  }

  const handleMissionIdsChange = (event: SelectChangeEvent<number[]>) => {
    const value = event.target.value
    onMissionIdsChange(typeof value === 'string' ? [] : value)
  }

  const handleStartDateChange = (nextStartDate: string) => {
    onStartDateChange(nextStartDate)

    if (endDate && nextStartDate && endDate < nextStartDate) {
      onEndDateChange('')
    }
  }

  return (
    <Box>
      <Typography variant='h4' sx={{ mb: mode === 'retention' ? 1 : 4 }}>
        {pageTitle}
      </Typography>
      {mode === 'retention' ? (
        <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
          فقط تراکنش‌های رسوب دریافتی (سهم رسوب لایه ۱ تا ۳)
        </Typography>
      ) : null}

      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: theme => `${theme.spacing(5)} !important` }}>
          <Typography variant='h6' sx={{ mb: 4, fontWeight: 600 }}>
            فیلتر تراکنش‌ها
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
                <JalaliDateField label='از تاریخ' value={startDate} onChange={handleStartDateChange} />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
                <JalaliDateField
                  label='تا تاریخ'
                  value={endDate}
                  onChange={onEndDateChange}
                  minDate={startDate || undefined}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
                <FormControl fullWidth>
                  <InputLabel id='mission-type-select-label'>نوع تراکنش</InputLabel>
                  <Select
                    labelId='mission-type-select-label'
                    value={missionType}
                    label='نوع تراکنش'
                    onChange={handleMissionTypeChange}
                  >
                    <MenuItem value='all'>همه</MenuItem>
                    {missionOptions.map(mission => (
                      <MenuItem key={mission.code} value={mission.code}>
                        {mission.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
                <FormControl fullWidth>
                  <InputLabel id='mission-id-select-label'>ماموریت</InputLabel>
                  <Select
                    multiple
                    labelId='mission-id-select-label'
                    value={missionIds}
                    onChange={handleMissionIdsChange}
                    input={<OutlinedInput label='ماموریت' />}
                    renderValue={selected => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map(id => {
                          const mission = missionOptions.find(item => item.id === id)

                          return (
                            <Chip
                              key={id}
                              label={mission?.title ?? id}
                              size='small'
                              variant='outlined'
                              sx={{ borderColor: 'divider', color: 'text.secondary' }}
                            />
                          )
                        })}
                      </Box>
                    )}
                  >
                    {missionOptions.map(mission => (
                      <MenuItem key={mission.id} value={mission.id}>
                        {mission.title}
                      </MenuItem>
                    ))}
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

'use client'

import { Suspense, useState, ChangeEvent } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import IconButton from '@mui/material/IconButton'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputAdornment from '@mui/material/InputAdornment'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'

import Icon from 'src/@core/components/icon'
import DashboardWidgetState from 'src/components/dashboard/DashboardWidgetState'
import { useNetworkSubsets } from 'src/hooks/network/useNetworkSubsets'

interface TableRowType {
  id: number
  fullName: string
  level: number
  joinDate: string
  subMembersCount: number
  leaderboardRank: number
}

const escapeRegExp = (value: string) => value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')

const columns: GridColDef[] = [
  {
    flex: 0.32,
    minWidth: 220,
    field: 'fullName',
    headerName: 'نام و نام خانوادگی',
    headerAlign: 'center',
    align: 'center',
    renderCell: (params: GridRenderCellParams) => (
      <Typography noWrap variant='body2' sx={{ fontWeight: 600 }}>
        {params.row.fullName}
      </Typography>
    )
  },
  {
    flex: 0.12,
    minWidth: 90,
    field: 'level',
    headerName: 'سطح',
    headerAlign: 'center',
    align: 'center'
  },
  {
    flex: 0.2,
    minWidth: 130,
    field: 'joinDate',
    headerName: 'تاریخ عضویت',
    headerAlign: 'center',
    align: 'center'
  },
  {
    flex: 0.18,
    minWidth: 130,
    field: 'subMembersCount',
    headerName: 'تعداد زیر مجموعه',
    headerAlign: 'center',
    align: 'center',
    type: 'number'
  },
  {
    flex: 0.18,
    minWidth: 120,
    field: 'leaderboardRank',
    headerName: 'رنک لیدربورد',
    headerAlign: 'center',
    align: 'center',
    renderCell: (params: GridRenderCellParams) =>
      params.row.leaderboardRank > 0 ? `#${params.row.leaderboardRank}` : '—'
  }
]

const dataGridLocaleText = {
  MuiTablePagination: {
    labelRowsPerPage: 'تعداد در صفحه',
    labelDisplayedRows: ({ from, to, count }: { from: number; to: number; count: number }) =>
      `${from}–${to} از ${count !== -1 ? count : `بیش از ${to}`}`
  }
}

const MySubsetsPageContent = () => {
  const [searchText, setSearchText] = useState('')
  const [filteredData, setFilteredData] = useState<TableRowType[]>([])
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 7 })

  const { data, loading, retrying, error, hasData, usedFallback, refetch } = useNetworkSubsets()
  const tableRows = data.rows

  const handleSearch = (searchValue: string) => {
    setSearchText(searchValue)
    if (!searchValue.trim()) {
      setFilteredData([])
      setPaginationModel(prev => ({ ...prev, page: 0 }))

      return
    }

    const searchRegex = new RegExp(escapeRegExp(searchValue), 'i')
    const filteredRows = tableRows.filter(row =>
      Object.values(row).some(value => searchRegex.test(String(value)))
    )
    setFilteredData(filteredRows)
    setPaginationModel(prev => ({ ...prev, page: 0 }))
  }

  const displayRows = filteredData.length ? filteredData : tableRows

  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 4 }}>
        زیر مجموعه های من
      </Typography>

      <Card>
        <DashboardWidgetState
          loading={loading}
          retrying={retrying}
          error={error}
          usedFallback={usedFallback}
          onRetry={refetch}
          skeletonHeight={480}
          widgetTitle='زیر مجموعه‌های من'
        >
          <CardContent sx={{ p: theme => theme.spacing(5, 6) }}>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 2,
                mb: 4,
                direction: 'rtl'
              }}
            >
            <Button
              variant='contained'
              size='small'
              onClick={() => handleSearch(searchText)}
              startIcon={<Icon icon='mdi:magnify' />}
              sx={{ minWidth: 110, height: 40, flexShrink: 0, gap: 1 }}
            >
              جستجو
            </Button>
              <OutlinedInput
                size='small'
                value={searchText}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
                placeholder='جستجو بر اساس نام کاربر...'
                dir='rtl'
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSearch(searchText)
                }}
                startAdornment={
                  <InputAdornment position='start'>
                    <Icon icon='mdi:magnify' fontSize={20} />
                  </InputAdornment>
                }
                endAdornment={
                  searchText ? (
                    <InputAdornment position='end'>
                      <IconButton
                        size='small'
                        aria-label='پاک کردن'
                        onClick={() => handleSearch('')}
                        edge='end'
                      >
                        <Icon icon='mdi:close' fontSize={20} />
                      </IconButton>
                    </InputAdornment>
                  ) : null
                }
                sx={{
                  flex: { xs: '1 1 100%', sm: '1 1 280px' },
                  maxWidth: { sm: 360 },
                  '& .MuiOutlinedInput-input': {
                    textAlign: 'right'
                  }
                }}
              />
            </Box>

            <Box sx={{ width: '100%', opacity: hasData ? 1 : 0.5 }}>
              <DataGrid
                autoHeight
                rows={displayRows}
                columns={columns}
                pageSizeOptions={[7, 10, 25, 50]}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                localeText={dataGridLocaleText}
                disableColumnMenu
                disableRowSelectionOnClick
                sx={{
                  border: 'none',
                  '& .MuiDataGrid-columnHeaders': {
                    bgcolor: theme => theme.palette.customColors?.tableHeaderBg || theme.palette.action.hover
                  },
                  '& .MuiDataGrid-columnHeaderTitle': {
                    fontWeight: 600
                  },
                  '& .MuiDataGrid-cell': {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  },
                  '& .MuiDataGrid-footerContainer': {
                    borderTop: theme => `1px solid ${theme.palette.divider}`,
                    '& .MuiTablePagination-toolbar': {
                      px: 2,
                      minHeight: 52,
                      flexWrap: 'wrap',
                      gap: 1
                    },
                    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                      margin: 0
                    }
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

const MySubsetsPage = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <MySubsetsPageContent />
  </Suspense>
)

export default MySubsetsPage

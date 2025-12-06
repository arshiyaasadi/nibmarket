'use client'

// ** React Imports
import { Suspense, useMemo } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
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
  // ** Sample data - replace with your actual data source
  const transactions: WalletTransaction[] = useMemo(
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


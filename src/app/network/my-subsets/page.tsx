'use client'

// ** React Imports
import { Suspense, useMemo, ReactNode, useState, ChangeEvent } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputAdornment from '@mui/material/InputAdornment'
import { styled } from '@mui/material/styles'
import TreeItem, { TreeItemProps } from '@mui/lab/TreeItem'
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbarProps } from '@mui/x-data-grid'

// ** TreeView Imports
import { TreeView } from 'src/utils/treeview-wrapper'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'

// ** Types
interface SubsetNode {
  id: string
  name: string
  membershipDate?: string
  averageCapital?: string | number
  children?: SubsetNode[]
}

interface TableRowType {
  id: number
  fullName: string
  level: number
  joinDate: string
  subMembersCount: number
  leaderboardRank: number
  avatar: string
}

type StyledTreeItemProps = TreeItemProps & {
  name: string
  membershipDate?: string
  averageCapital?: string | number
}

const escapeRegExp = (value: string) => {
  return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}

// ** Table Mock Data
const tableRows: TableRowType[] = [
  { id: 1, fullName: 'علی احمدی', level: 5, joinDate: '1402/08/15', subMembersCount: 12, leaderboardRank: 3, avatar: '/images/avatars/1.png' },
  { id: 2, fullName: 'سارا محمدی', level: 7, joinDate: '1402/07/20', subMembersCount: 25, leaderboardRank: 1, avatar: '/images/avatars/2.png' },
  { id: 3, fullName: 'رضا کریمی', level: 4, joinDate: '1402/09/10', subMembersCount: 8, leaderboardRank: 15, avatar: '/images/avatars/3.png' },
  { id: 4, fullName: 'زهرا رضایی', level: 6, joinDate: '1402/06/05', subMembersCount: 18, leaderboardRank: 5, avatar: '/images/avatars/4.png' },
  { id: 5, fullName: 'محمد حسینی', level: 3, joinDate: '1402/09/25', subMembersCount: 5, leaderboardRank: 28, avatar: '/images/avatars/5.png' },
  { id: 6, fullName: 'فاطمه علیزاده', level: 8, joinDate: '1402/05/12', subMembersCount: 32, leaderboardRank: 2, avatar: '/images/avatars/6.png' },
  { id: 7, fullName: 'حسن رضوی', level: 2, joinDate: '1402/10/01', subMembersCount: 3, leaderboardRank: 42, avatar: '/images/avatars/7.png' },
  { id: 8, fullName: 'مریم کاظمی', level: 5, joinDate: '1402/08/18', subMembersCount: 14, leaderboardRank: 10, avatar: '/images/avatars/8.png' }
]

// ** Custom Search Toolbar
interface CustomSearchToolbarProps extends Omit<GridToolbarProps, 'onChange'> {
  value?: string
  clearSearch?: () => void
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
}

const CustomSearchToolbar = (props: CustomSearchToolbarProps) => {
  const { settings } = useSettings()
  const isRtl = settings.direction === 'rtl'

  const handleSearchClick = () => {
    // جستجو با کلیک روی دکمه انجام می‌شود از طریق onChange
    if (props.value && props.onChange) {
      const event = {
        target: { value: props.value }
      } as ChangeEvent<HTMLInputElement>
      props.onChange(event)
    }
  }

  return (
    <Box
      sx={{
        gap: 2,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: isRtl ? 'flex-end' : 'flex-start',
        p: theme => theme.spacing(2, 5, 4, 5),
        direction: isRtl ? 'rtl' : 'ltr'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexDirection: isRtl ? 'row-reverse' : 'row' }}>
        <OutlinedInput
          size='small'
          value={props.value || ''}
          onChange={props.onChange}
          placeholder='جستجو بر اساس نام کاربر...'
          dir='rtl'
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearchClick()
            }
          }}
          startAdornment={
            <InputAdornment position='start'>
              <Icon icon='mdi:magnify' fontSize={20} />
            </InputAdornment>
          }
          endAdornment={
            props.value ? (
              <InputAdornment position='end'>
                <IconButton size='small' title='پاک کردن' aria-label='پاک کردن' onClick={props.clearSearch} edge='end'>
                  <Icon icon='mdi:close' fontSize={20} />
                </IconButton>
              </InputAdornment>
            ) : null
          }
          sx={{
            width: {
              xs: 1,
              sm: '320px'
            },
            direction: 'rtl',
            '& .MuiOutlinedInput-input': {
              direction: 'rtl',
              textAlign: 'right'
            }
          }}
        />
        <Button
          variant='contained'
          size='small'
          onClick={handleSearchClick}
          startIcon={!isRtl && <Icon icon='mdi:magnify' />}
          endIcon={isRtl && <Icon icon='mdi:magnify' />}
          sx={{ minWidth: '110px', height: '40px' }}
        >
          جستجو
        </Button>
      </Box>
    </Box>
  )
}

// ** Render Client Avatar
const renderClient = (params: GridRenderCellParams) => {
  const { row } = params

  if (row.avatar) {
    return <CustomAvatar src={row.avatar} sx={{ ml: 3, width: '1.875rem', height: '1.875rem' }} />
  } else {
    return (
      <CustomAvatar
        skin='light'
        color='primary'
        sx={{ ml: 3, fontSize: '.8rem', width: '1.875rem', height: '1.875rem' }}
      >
        {getInitials(row.fullName ? row.fullName : 'کاربر')}
      </CustomAvatar>
    )
  }
}

// ** Table Columns - ترتیب برعکس شده برای RTL
const columns: GridColDef[] = [
  {
    flex: 0.15,
    minWidth: 140,
    field: 'leaderboardRank',
    headerName: 'رنک لیدربورد',
    headerAlign: 'center',
    align: 'center',
    renderCell: (params: GridRenderCellParams) => (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
        <Typography variant='body2' sx={{ color: 'text.primary', fontWeight: 600 }}>
        #{params.row.leaderboardRank}
      </Typography>
      </Box>
    )
  },
  {
    flex: 0.15,
    minWidth: 140,
    field: 'subMembersCount',
    headerName: 'تعداد زیر مجموعه',
    headerAlign: 'center',
    align: 'center',
    renderCell: (params: GridRenderCellParams) => (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
        {params.row.subMembersCount}
      </Typography>
      </Box>
    )
  },
  {
    flex: 0.2,
    minWidth: 150,
    field: 'joinDate',
    headerName: 'تاریخ عضویت',
    headerAlign: 'center',
    align: 'center',
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
    minWidth: 120,
    field: 'level',
    headerName: 'سطح',
    headerAlign: 'center',
    align: 'center',
    renderCell: (params: GridRenderCellParams) => (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
        <Typography variant='body2' sx={{ color: 'text.primary' }}>
        {params.row.level}
      </Typography>
      </Box>
    )
  },
  {
    flex: 0.3,
    minWidth: 250,
    field: 'fullName',
    headerName: 'نام و نام خانوادگی',
    headerAlign: 'center',
    align: 'center',
    renderCell: (params: GridRenderCellParams) => {
      const { row } = params

      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
          {renderClient(params)}
          <Typography noWrap variant='body2' sx={{ color: 'text.primary', fontWeight: 600, ml: 2 }}>
            {row.fullName}
          </Typography>
        </Box>
      )
    }
  }
]

// Styled TreeItem component
// @ts-ignore - React 19 compatibility issue with styled(TreeItem)
const StyledTreeItemRoot = styled(TreeItem)<TreeItemProps>(({ theme }) => ({
  '&:hover > .MuiTreeItem-content:not(.Mui-selected)': {
    backgroundColor: theme.palette.action.hover
  },
  '& .MuiTreeItem-content': {
    paddingRight: theme.spacing(3),
    paddingLeft: theme.spacing(3),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    borderTopRightRadius: theme.spacing(2),
    borderBottomRightRadius: theme.spacing(2),
    fontWeight: theme.typography.fontWeightMedium
  },
  '& .MuiTreeItem-label': {
    fontWeight: 'inherit',
    paddingRight: theme.spacing(2)
  },
  '& .MuiTreeItem-group': {
    marginLeft: 0,
    '& .MuiTreeItem-content': {
      paddingLeft: theme.spacing(4),
      fontWeight: theme.typography.fontWeightRegular
    }
  }
}))

const StyledTreeItem = (props: StyledTreeItemProps) => {
  // ** Props
  const { name, membershipDate, averageCapital, ...other } = props

  return (
    <StyledTreeItemRoot
      {...other}
      label={
        <Box sx={{ py: 0.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant='body2' sx={{ fontWeight: 'inherit' }}>
            {name || '(بدون نام)'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 0.5 }}>
            {membershipDate && (
              <Typography variant='caption' color='text.secondary'>
                تاریخ عضویت: {membershipDate}
              </Typography>
            )}
            {averageCapital !== undefined && (
              <Typography variant='caption' color='text.secondary'>
                میانگین سرمایه: {typeof averageCapital === 'number' ? averageCapital.toLocaleString('fa-IR') : averageCapital}
              </Typography>
            )}
          </Box>
        </Box>
      }
    />
  )
}

const MySubsetsPageContent = () => {
  // ** States
  const [searchText, setSearchText] = useState<string>('')
  const [filteredData, setFilteredData] = useState<TableRowType[]>([])
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 7 })

  // ** Hooks
  const { settings } = useSettings()
  const direction = settings.direction || 'rtl'

  // ** Sample data structure - replace with your actual data
  const treeData: SubsetNode[] = useMemo(
    () => [
      {
        id: '1',
        name: 'کاربر ۱',
        membershipDate: '۱۴۰۳/۰۱/۱۵',
        averageCapital: 5000000,
        children: [
          {
            id: '1-1',
            name: 'کاربر ۱-۱',
            membershipDate: '۱۴۰۳/۰۲/۱۰',
            averageCapital: 3000000,
            children: [
              {
                id: '1-1-1',
                name: 'کاربر ۱-۱-۱',
                membershipDate: '۱۴۰۳/۰۳/۰۵',
                averageCapital: 1500000
              }
            ]
          },
          {
            id: '1-2',
            name: 'کاربر ۱-۲',
            membershipDate: '۱۴۰۳/۰۲/۲۰',
            averageCapital: 2500000,
            children: [
              {
                id: '1-2-1',
                name: 'کاربر ۱-۲-۱',
                membershipDate: '۱۴۰۳/۰۳/۱۲',
                averageCapital: 1200000,
                children: [
                  {
                    id: '1-2-1-1',
                    name: 'کاربر ۱-۲-۱-۱',
                    membershipDate: '۱۴۰۳/۰۴/۰۱',
                    averageCapital: 800000
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    []
  )

  // ** Render tree recursively
  const renderTree = (nodes: SubsetNode): ReactNode => {
    return (
      <StyledTreeItem
        key={nodes.id}
        nodeId={nodes.id}
        name={nodes.name}
        membershipDate={nodes.membershipDate}
        averageCapital={nodes.averageCapital}
      >
        {Array.isArray(nodes.children) && nodes.children.length > 0
          ? nodes.children.map(node => renderTree(node))
          : null}
      </StyledTreeItem>
    )
  }

  // ** Get all node IDs for default expanded
  const getAllNodeIds = (nodes: SubsetNode[]): string[] => {
    const ids: string[] = []
    const traverse = (node: SubsetNode) => {
      ids.push(node.id)
      if (node.children) {
        node.children.forEach(traverse)
      }
    }
    nodes.forEach(traverse)
    return ids
  }

  const defaultExpanded = useMemo(() => getAllNodeIds(treeData), [treeData])
  const ExpandIcon = direction === 'rtl' ? 'mdi:chevron-left' : 'mdi:chevron-right'

  // ** Handle Search
  const handleSearch = (searchValue: string) => {
    setSearchText(searchValue)
    const searchRegex = new RegExp(escapeRegExp(searchValue), 'i')
    const filteredRows = tableRows.filter(row => {
      return Object.keys(row).some(field => {
        // @ts-ignore
        return searchRegex.test(row[field]?.toString())
      })
    })
    if (searchValue.length) {
      setFilteredData(filteredRows)
    } else {
      setFilteredData([])
    }
  }

  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 4 }}>
        زیر مجموعه های من
      </Typography>

      {/* Users Table with Search */}
      <Card>
        <CardContent sx={{ p: theme => theme.spacing(5, 6) }}>
          <Box sx={{ direction: 'rtl' }} suppressHydrationWarning>
            <DataGrid
              autoHeight
              columns={columns}
              pageSizeOptions={[7, 10, 25, 50]}
              paginationModel={paginationModel}
              slots={{ toolbar: CustomSearchToolbar }}
              onPaginationModelChange={setPaginationModel}
              rows={filteredData.length ? filteredData : tableRows}
              slotProps={{
                baseButton: {
                  variant: 'outlined'
                },
                toolbar: {
                  value: searchText,
                  clearSearch: () => handleSearch(''),
                  onChange: (event: ChangeEvent<HTMLInputElement>) => handleSearch(event.target.value)
                } as any
              }}
              sx={{
                direction: 'rtl',
              '& .MuiDataGrid-root': {
                direction: 'rtl',
                border: 'none'
              },
              '& .MuiDataGrid-main': {
                direction: 'rtl'
              },
              '& .MuiDataGrid-columnHeaders': {
                direction: 'rtl',
                backgroundColor: theme => theme.palette.customColors.tableHeaderBg || theme.palette.action.hover,
                '& .MuiDataGrid-columnHeader': {
                  textAlign: 'center',
                  justifyContent: 'center',
                  paddingLeft: theme => theme.spacing(5),
                  paddingRight: theme => theme.spacing(5),
                  '&:first-of-type': {
                    paddingRight: theme => theme.spacing(5)
                  },
                  '&:last-of-type': {
                    paddingLeft: theme => theme.spacing(5)
                  },
                  '& .MuiDataGrid-columnHeaderTitleContainer': {
                    flexDirection: 'row',
                    justifyContent: 'center',
                    width: '100%'
                  },
                  '& .MuiDataGrid-columnHeaderTitle': {
                    textAlign: 'center',
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  }
                }
              },
              '& .MuiDataGrid-row': {
                '&:hover': {
                  backgroundColor: theme => theme.palette.action.hover
                },
                '&:last-of-type': {
                  '& .MuiDataGrid-cell': {
                    borderBottom: 0
                  }
                }
              },
              '& .MuiDataGrid-cell': {
                direction: 'rtl',
                textAlign: 'center',
                justifyContent: 'center',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: theme => theme.spacing(5),
                paddingRight: theme => theme.spacing(5),
                '&:first-of-type': {
                  paddingRight: theme => theme.spacing(5)
                },
                '&:last-of-type': {
                  paddingLeft: theme => theme.spacing(5)
                },
                '& .MuiBox-root': {
                  direction: 'rtl',
                  justifyContent: 'center',
                  width: '100%'
                }
              },
              '& .MuiDataGrid-footerContainer': {
                direction: 'rtl',
                borderTop: theme => `1px solid ${theme.palette.divider}`,
                minHeight: '52px',
                '& .MuiTablePagination-root': {
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  margin: 0
                },
                '& .MuiTablePagination-toolbar': {
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  minHeight: '52px',
                  padding: '0 !important',
                  gap: theme => theme.spacing(2),
                  '& .MuiTablePagination-spacer': {
                    display: 'none !important',
                    flex: 'none !important',
                    width: 0,
                    minWidth: 0
                  },
                  '& .MuiTablePagination-selectLabel': {
                    margin: 0,
                    order: 1,
                    fontSize: '0.875rem'
                  },
                  '& .MuiTablePagination-select': {
                    order: 2,
                    marginLeft: theme => theme.spacing(1),
                    marginRight: theme => theme.spacing(1),
                    fontSize: '0.875rem'
                  },
                  '& .MuiTablePagination-displayedRows': {
                    margin: 0,
                    order: 3,
                    fontSize: '0.875rem'
                  },
                  '& .MuiTablePagination-actions': {
                    margin: 0,
                    order: 4,
                    marginRight: theme => theme.spacing(1),
                    '& .MuiIconButton-root': {
                      padding: theme => theme.spacing(1)
                    }
                  }
                }
              },
              '& .MuiDataGrid-columnSeparator': {
                display: 'none'
              },
              '& .MuiDataGrid-virtualScroller': {
                direction: 'rtl'
              },
              '& .MuiDataGrid-virtualScrollerContent': {
                direction: 'rtl'
              },
              '& .MuiDataGrid-columnHeader[data-field]': {
                direction: 'rtl'
              },
              '& [role="columnheader"]': {
                direction: 'rtl',
                textAlign: 'center'
              }
            }}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

const MySubsetsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MySubsetsPageContent />
    </Suspense>
  )
}

export default MySubsetsPage

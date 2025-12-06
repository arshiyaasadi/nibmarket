'use client'

// ** React Imports
import { Suspense, useMemo, ReactNode } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import { styled } from '@mui/material/styles'
import TreeItem, { TreeItemProps } from '@mui/lab/TreeItem'

// ** TreeView Imports
import { TreeView } from 'src/utils/treeview-wrapper'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Types
interface SubsetNode {
  id: string
  name: string
  membershipDate?: string
  averageCapital?: string | number
  children?: SubsetNode[]
}

type StyledTreeItemProps = TreeItemProps & {
  name: string
  membershipDate?: string
  averageCapital?: string | number
}

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

  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 4 }}>
        زیر مجموعه های من
      </Typography>
      <Card>
        <CardContent>
          <TreeView
            sx={{ minHeight: 400, width: '100%' }}
            defaultExpanded={defaultExpanded}
            defaultExpandIcon={<Icon icon={ExpandIcon} />}
            defaultCollapseIcon={<Icon icon='mdi:chevron-down' />}
          >
            {treeData.map(node => renderTree(node))}
          </TreeView>
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

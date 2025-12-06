'use client'

// ** React Imports
import { Suspense, useMemo } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

// ** TreeView Imports
import { TreeView, TreeItem } from 'src/utils/treeview-wrapper'

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

const SubsetTreePageContent = () => {
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

  // ** Render tree recursively with custom label
  const renderTree = (nodes: SubsetNode) => {
    const labelContent = (
      <Box sx={{ py: 0.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography variant='body2' sx={{ fontWeight: 'inherit' }}>
          {nodes.name || '(بدون نام)'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 0.5 }}>
          {nodes.membershipDate && (
            <Typography variant='caption' color='text.secondary'>
              تاریخ عضویت: {nodes.membershipDate}
            </Typography>
          )}
          {nodes.averageCapital !== undefined && (
            <Typography variant='caption' color='text.secondary'>
              میانگین سرمایه: {typeof nodes.averageCapital === 'number' ? nodes.averageCapital.toLocaleString('fa-IR') : nodes.averageCapital}
            </Typography>
          )}
        </Box>
      </Box>
    )

    return (
      <TreeItem key={nodes.id} nodeId={nodes.id} label={labelContent}>
        {Array.isArray(nodes.children) && nodes.children.length > 0
          ? nodes.children.map(node => renderTree(node))
          : null}
      </TreeItem>
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
        درخت زیر مجموعه
      </Typography>
      <Card>
        <CardContent>
          {treeData.length > 0 ? (
            <TreeView
              sx={{ minHeight: 400, width: '100%' }}
              defaultExpanded={defaultExpanded}
              defaultExpandIcon={<Icon icon={ExpandIcon} />}
              defaultCollapseIcon={<Icon icon='mdi:chevron-down' />}
            >
              {treeData.map(node => renderTree(node))}
            </TreeView>
          ) : (
            <Typography variant='body2' color='text.secondary'>
              داده‌ای برای نمایش وجود ندارد
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

const SubsetTreePage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SubsetTreePageContent />
    </Suspense>
  )
}

export default SubsetTreePage

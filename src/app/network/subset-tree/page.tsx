'use client'

// ** React Imports
import { Suspense, useMemo, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

// ** MUI X Tree View Imports
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView'
import { TreeItem } from '@mui/x-tree-view/TreeItem'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Component Imports
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Types
interface SubsetNode {
  id: string
  firstName: string
  lastName: string
  avatar?: string
  membershipDate?: string
  averageCapital?: string | number
  children?: SubsetNode[]
}


const SubsetTreePageContent = () => {
  // ** Hooks
  const { settings } = useSettings()
  const direction = settings.direction || 'rtl'

  // ** Helper function to get initials
  const getInitials = (firstName: string, lastName: string) => {
    const firstInitial = firstName && firstName.length > 0 ? firstName[0] : ''
    const lastInitial = lastName && lastName.length > 0 ? lastName[0] : ''
    return `${firstInitial}${lastInitial}` || '?'
  }

  // ** Sample data structure - replace with your actual data
  const treeData: SubsetNode[] = useMemo(
    () => [
      {
        id: '1',
        firstName: 'علی',
        lastName: 'احمدی',
        membershipDate: '۱۴۰۳/۰۱/۱۵',
        averageCapital: 5000000,
        children: [
          {
            id: '1-1',
            firstName: 'محمد',
            lastName: 'رضایی',
            membershipDate: '۱۴۰۳/۰۲/۱۰',
            averageCapital: 3000000,
            children: [
              {
                id: '1-1-1',
                firstName: 'حسن',
                lastName: 'کریمی',
                membershipDate: '۱۴۰۳/۰۳/۰۵',
                averageCapital: 1500000
              }
            ]
          },
          {
            id: '1-2',
            firstName: 'رضا',
            lastName: 'محمدی',
            membershipDate: '۱۴۰۳/۰۲/۲۰',
            averageCapital: 2500000,
            children: [
              {
                id: '1-2-1',
                firstName: 'امیر',
                lastName: 'حسینی',
                membershipDate: '۱۴۰۳/۰۳/۱۲',
                averageCapital: 1200000,
                children: [
                  {
                    id: '1-2-1-1',
                    firstName: 'سعید',
                    lastName: 'نوری',
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

  // ** Render node content
  const renderNodeContent = (nodes: SubsetNode, isRoot: boolean = false) => {
    const fullName = `${nodes.firstName} ${nodes.lastName}`.trim() || '(بدون نام)'
    
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
          py: 2,
          px: 2,
          position: 'relative'
        }}
      >
        {/* Node Shape - Circle for root, Square for children */}
        <Box
          sx={{
            width: isRoot ? 80 : 100,
            height: isRoot ? 80 : 100,
            borderRadius: isRoot ? '50%' : 2,
            backgroundColor: isRoot ? '#FFD700' : '#17A2B8', // Yellow for root, Teal for children
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: theme => theme.shadows[2],
            position: 'relative',
            zIndex: 2
          }}
        >
          {/* User Avatar or Initials */}
          {nodes.avatar ? (
            <CustomAvatar
              src={nodes.avatar}
              alt={fullName}
              sx={{ 
                width: isRoot ? 70 : 90, 
                height: isRoot ? 70 : 90,
                borderRadius: isRoot ? '50%' : 2
              }}
            />
          ) : (
            <Typography 
              variant={isRoot ? 'h6' : 'body1'} 
              sx={{ 
                color: 'white', 
                fontWeight: 600,
                fontSize: isRoot ? '1.5rem' : '1rem'
              }}
            >
              {getInitials(nodes.firstName, nodes.lastName)}
            </Typography>
          )}
        </Box>

        {/* User Info */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 0.5, 
          textAlign: 'center',
          maxWidth: 150
        }}>
          <Typography variant='body2' sx={{ fontWeight: 600 }}>
            {fullName}
          </Typography>
          {nodes.membershipDate && (
            <Typography variant='caption' color='text.secondary'>
              {nodes.membershipDate}
            </Typography>
          )}
          {nodes.averageCapital !== undefined && (
            <Typography variant='caption' color='text.secondary'>
              {typeof nodes.averageCapital === 'number' 
                ? nodes.averageCapital.toLocaleString('fa-IR') 
                : nodes.averageCapital} تومان
            </Typography>
          )}
        </Box>
      </Box>
    )
  }

  // ** Render tree recursively with custom label
  const renderTree = (nodes: SubsetNode, isRoot: boolean = false) => {
    const hasChildren = Array.isArray(nodes.children) && nodes.children.length > 0
    
    // If root node with children, render children horizontally
    if (isRoot && hasChildren) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <TreeItem key={nodes.id} itemId={nodes.id} label={renderNodeContent(nodes, true)} />
           <Box
             sx={{
               display: 'flex',
               flexDirection: 'row',
               justifyContent: 'space-around',
               alignItems: 'flex-start',
               gap: theme => theme.spacing(4),
               marginTop: theme => theme.spacing(3),
               paddingTop: theme => theme.spacing(3),
               position: 'relative',
               width: '100%',
               '&::before': {
                 content: '""',
                 position: 'absolute',
                 top: 0,
                 left: '50%',
                 transform: 'translateX(-50%)',
                 width: '2px',
                 height: theme => theme.spacing(3),
                 backgroundColor: '#6C757D',
                 zIndex: 1
               },
               '&::after': {
                 content: '""',
                 position: 'absolute',
                 top: theme => theme.spacing(3),
                 left: '5%',
                 right: '5%',
                 height: '2px',
                 backgroundColor: '#6C757D',
                 zIndex: 1
               }
             }}
           >
            {nodes.children!.map((child) => (
              <Box
                key={child.id}
                sx={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: theme => `-${theme.spacing(3)}`,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '2px',
                    height: theme => theme.spacing(3),
                    backgroundColor: '#6C757D',
                    zIndex: 1
                  }
                }}
              >
                <SimpleTreeView
                  defaultExpandedItems={getAllNodeIds([child])}
                  sx={{
                    '& .MuiTreeItem-group': {
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'flex-start',
                      gap: theme => theme.spacing(4)
                    }
                  }}
                >
                  {renderTree(child, false)}
                </SimpleTreeView>
              </Box>
            ))}
          </Box>
        </Box>
      )
    }

    return (
      <TreeItem key={nodes.id} itemId={nodes.id} label={renderNodeContent(nodes, isRoot)}>
        {hasChildren
          ? nodes.children!.map(node => renderTree(node, false))
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

  const defaultExpandedItems = useMemo(() => getAllNodeIds(treeData), [treeData])

  // ** Add global style to force horizontal layout
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      .MuiTreeItem-group {
        display: flex !important;
        flex-direction: row !important;
        flex-wrap: nowrap !important;
        justify-content: center !important;
        align-items: flex-start !important;
      }
      .MuiTreeItem-group > .MuiTreeItem-root {
        display: inline-flex !important;
        flex: 0 0 auto !important;
        width: auto !important;
        max-width: none !important;
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 4 }}>
        درخت زیر مجموعه
      </Typography>
      <Card>
        <CardContent sx={{ p: theme => `${theme.spacing(5)} !important` }}>
          {treeData.length > 0 ? (
            <Box
              sx={{
                width: '100%',
                minHeight: 400,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                py: 4,
                // Global style override for TreeItem groups
                '& .MuiTreeItem-group': {
                  display: 'flex !important',
                  flexDirection: 'row !important',
                  flexWrap: 'nowrap !important',
                  justifyContent: 'center !important',
                  alignItems: 'flex-start !important'
                },
                '& .MuiSimpleTreeView-root': {
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  '& .MuiTreeItem-group': {
                    display: 'flex !important',
                    flexDirection: 'row !important',
                    flexWrap: 'nowrap !important',
                    justifyContent: 'center !important',
                    alignItems: 'flex-start !important'
                  }
                },
                '& .MuiTreeItem-root': {
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginBottom: theme => theme.spacing(2),
                  width: 'auto',
                  minWidth: 'auto'
                },
                '& > .MuiTreeItem-root': {
                  width: '100%'
                },
                '& .MuiTreeItem-content': {
                  padding: 0,
                  justifyContent: 'center',
                  '&:hover': {
                    backgroundColor: 'transparent'
                  }
                },
                '& .MuiTreeItem-iconContainer': {
                  display: 'none' // Hide default expand/collapse icons
                },
                '& .MuiTreeItem-group': {
                  display: 'flex !important',
                  flexDirection: 'row !important',
                  flexWrap: 'nowrap !important',
                  justifyContent: 'center !important',
                  alignItems: 'flex-start !important',
                  gap: theme => `${theme.spacing(4)} !important`,
                  marginTop: theme => `${theme.spacing(3)} !important`,
                  paddingTop: theme => `${theme.spacing(3)} !important`,
                  paddingLeft: '0 !important',
                  paddingRight: '0 !important',
                  marginLeft: '0 !important',
                  marginRight: '0 !important',
                  position: 'relative',
                  width: '100%',
                  '& > *': {
                    flexShrink: 0,
                    display: 'inline-flex !important',
                    flexDirection: 'column !important',
                    width: 'auto !important',
                    maxWidth: 'none !important'
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '2px',
                    height: theme => theme.spacing(3),
                    backgroundColor: '#6C757D', // Vertical connector line from parent
                    zIndex: 1
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: theme => theme.spacing(3),
                    left: '5%',
                    right: '5%',
                    height: '2px',
                    backgroundColor: '#6C757D', // Horizontal connector line
                    zIndex: 1
                  },
                  '& > .MuiTreeItem-root': {
                    position: 'relative !important',
                    display: 'inline-flex !important',
                    flex: '0 0 auto !important',
                    width: 'auto !important',
                    maxWidth: 'none !important',
                    minWidth: 'auto !important',
                    marginBottom: theme => `${theme.spacing(2)} !important`,
                    marginLeft: '0 !important',
                    marginRight: '0 !important',
                    marginTop: '0 !important',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: theme => `-${theme.spacing(3)}`,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '2px',
                      height: theme => theme.spacing(3),
                      backgroundColor: '#6C757D', // Vertical connector line to child
                      zIndex: 1
                    }
                  }
                },
                // Additional global override
                '& * .MuiTreeItem-group': {
                  display: 'flex !important',
                  flexDirection: 'row !important',
                  flexWrap: 'nowrap !important'
                },
                '& .MuiTreeItem-label': {
                  padding: 0
                }
              }}
            >
              <SimpleTreeView
                defaultExpandedItems={defaultExpandedItems}
                sx={{
                  minHeight: 400,
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                {treeData.map(node => renderTree(node, true))}
              </SimpleTreeView>
            </Box>
          ) : (
            <Typography variant='body2' color='text.secondary' sx={{ textAlign: 'center', py: 4 }}>
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

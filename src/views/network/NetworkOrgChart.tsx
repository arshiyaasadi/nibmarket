'use client'

import type { ComponentType, ReactNode } from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import {
  Tree as OrgTree,
  TreeNode as OrgTreeNode,
  type TreeNodeProps,
  type TreeProps
} from 'react-organizational-chart'

import type { NetworkTreeNode } from 'src/types/api/network'

const Tree = OrgTree as ComponentType<TreeProps>
const TreeNode = OrgTreeNode as ComponentType<TreeNodeProps>

type Props = {
  roots: NetworkTreeNode[]
  truncated?: boolean
}

function NodeLabel({ node }: { node: NetworkTreeNode }) {
  return (
    <Box
      sx={{
        px: 1.5,
        py: 0.75,
        borderRadius: 1.5,
        border: theme => `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
        boxShadow: theme => theme.shadows[1],
        minWidth: 96,
        maxWidth: 160
      }}
    >
      <Typography
        variant='caption'
        sx={{ fontWeight: 600, display: 'block', textAlign: 'center', lineHeight: 1.4 }}
      >
        {node.fullName}
      </Typography>
    </Box>
  )
}

function SubsetTreeBranch({ node }: { node: NetworkTreeNode }): ReactNode {
  if (node.children.length === 0) {
    return <TreeNode label={<NodeLabel node={node} />} />
  }

  return (
    <TreeNode label={<NodeLabel node={node} />}>
      {node.children.map(child => (
        <SubsetTreeBranch key={child.id} node={child} />
      ))}
    </TreeNode>
  )
}

export default function NetworkOrgChart({ roots, truncated = false }: Props) {
  if (roots.length === 0) {
    return (
      <Typography variant='body2' color='text.secondary' sx={{ py: 6, textAlign: 'center' }}>
        زیرمجموعه‌ای یافت نشد
      </Typography>
    )
  }

  const treeProps = {
    lineWidth: '2px',
    lineColor: '#D1D5DB',
    lineBorderRadius: '0px',
    lineHeight: '20px',
    nodePadding: '8px'
  } as const

  const chart =
    roots.length === 1 ? (
      <Tree {...treeProps} label={<NodeLabel node={roots[0]} />}>
        {roots[0].children.map(child => (
          <SubsetTreeBranch key={child.id} node={child} />
        ))}
      </Tree>
    ) : (
      <Tree {...treeProps} label={<Box sx={{ width: 1, height: 1 }} aria-hidden />}>
        {roots.map(root => (
          <SubsetTreeBranch key={root.id} node={root} />
        ))}
      </Tree>
    )

  return (
    <Box>
      <Box
        sx={{
          overflow: 'auto',
          py: 4,
          px: 2,
          direction: 'ltr',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        {chart}
      </Box>
      {truncated ? (
        <Typography variant='caption' color='text.secondary' sx={{ display: 'block', textAlign: 'center', pb: 2 }}>
          به‌دلیل حجم زیاد، فقط بخشی از درخت نمایش داده شده است.
        </Typography>
      ) : null}
    </Box>
  )
}

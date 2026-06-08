'use client'

import { useLayoutEffect, useMemo, useRef, useState, type ComponentType } from 'react'
import OrgTree from 'react-d3-tree'
import type { CustomNodeElementProps, RawNodeDatum, TreeProps } from 'react-d3-tree'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

import type { NetworkTreeNode } from 'src/types/api/network'

const Tree = OrgTree as ComponentType<TreeProps>

type Props = {
  root: NetworkTreeNode | null
  truncated?: boolean
  minHeight?: number
}

function toD3Datum(node: NetworkTreeNode): RawNodeDatum {
  return {
    name: node.fullName,
    attributes: {
      isSelf: node.isSelf ? '1' : '0',
      level: String(node.level),
      firstName: node.firstName,
      lastName: node.lastName
    },
    children: node.children.length > 0 ? node.children.map(toD3Datum) : undefined
  }
}

type NodeColors = {
  primaryMain: string
  primaryDark: string
  textPrimary: string
  textSecondary: string
}

const LABEL_WIDTH = 160
const LABEL_GAP = 16
const NODE_SIZE_X = 300
const NODE_SIZE_Y = 96

function getTreeDepth(node: NetworkTreeNode): number {
  if (node.children.length === 0) return 1

  return 1 + Math.max(...node.children.map(getTreeDepth))
}

// react-d3-tree invokes this as a plain render callback — no hooks allowed here.
function renderOrgChartNode(colors: NodeColors) {
  return function OrgChartNode({ nodeDatum }: CustomNodeElementProps) {
    const isSelf = nodeDatum.attributes?.isSelf === '1'
    const level = nodeDatum.attributes?.level
    const showLevel = Boolean(level && level !== '0')

    const radius = isSelf ? 12 : 10
    const labelFill = isSelf ? colors.primaryDark : colors.textPrimary
    const displayName = String(nodeDatum.name || '—')
    const labelBoxX = -(LABEL_WIDTH + LABEL_GAP + radius)

    return (
      <g className='network-org-node'>
        <circle
          r={radius}
          fill={isSelf ? colors.primaryMain : '#3f4554'}
          stroke={isSelf ? colors.primaryDark : '#2f3440'}
          strokeWidth={1.5}
        />
        <foreignObject
          x={labelBoxX}
          y={showLevel ? -16 : -11}
          width={LABEL_WIDTH}
          height={showLevel ? 38 : 22}
          style={{ overflow: 'visible' }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              direction: 'ltr',
              lineHeight: 1.35,
              pointerEvents: 'none',
              fontFamily: 'IRANSans, Vazir, Tahoma, Arial, sans-serif'
            }}
          >
            <div
              dir='rtl'
              style={{
                fontSize: isSelf ? 13 : 12,
                fontWeight: 600,
                color: labelFill,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
                direction: 'rtl',
                textAlign: 'right',
                unicodeBidi: 'plaintext'
              }}
            >
              {displayName}
            </div>
            {showLevel ? (
              <div style={{ fontSize: 10, fontWeight: 400, color: colors.textSecondary, marginTop: 2 }}>
                {`سطح ${level}`}
              </div>
            ) : null}
          </div>
        </foreignObject>
      </g>
    )
  }
}

export default function NetworkOrgChart({ root, truncated = false, minHeight = 420 }: Props) {
  const theme = useTheme()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [layout, setLayout] = useState<{ width: number; height: number; translate: { x: number; y: number } } | null>(
    null
  )

  const treeData = useMemo(() => (root ? toD3Datum(root) : null), [root])
  const treeDepth = useMemo(() => (root ? getTreeDepth(root) : 1), [root])

  const renderNode = useMemo(
    () =>
      renderOrgChartNode({
        primaryMain: theme.palette.primary.main,
        primaryDark: theme.palette.primary.dark,
        textPrimary: theme.palette.text.primary,
        textSecondary: theme.palette.text.secondary
      }),
    [
      theme.palette.primary.main,
      theme.palette.primary.dark,
      theme.palette.text.primary,
      theme.palette.text.secondary
    ]
  )

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el || !treeData) return

    const update = () => {
      const { width, height } = el.getBoundingClientRect()
      const labelOffset = (LABEL_WIDTH + LABEL_GAP) / 2
      const estimatedTreeHeight = treeDepth * NODE_SIZE_Y
      const translateY = Math.max(52, (height - estimatedTreeHeight) / 2 + 36)

      setLayout({
        width,
        height,
        translate: { x: width / 2 + labelOffset, y: translateY }
      })
    }

    update()

    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null
    observer?.observe(el)

    return () => observer?.disconnect()
  }, [treeData, treeDepth])

  if (!treeData) {
    return (
      <Box
        sx={{
          width: '100%',
          minHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography variant='body2' color='text.secondary'>
          زیرمجموعه‌ای یافت نشد
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%', minHeight, display: 'flex', flexDirection: 'column' }}>
      <Box
        ref={containerRef}
        sx={{
          width: '100%',
          minHeight,
          height: minHeight,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          direction: 'ltr',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          cursor: 'grab',
          '&:active': {
            cursor: 'grabbing'
          },
          '& .rd3t-tree-container': {
            width: '100%',
            height: '100%'
          },
          '& .rd3t-link': {
            stroke: '#9ca3af',
            strokeWidth: 1.5
          },
          '& .rd3t-node, & .rd3t-leaf-node': {
            fill: 'none',
            stroke: 'none',
            cursor: 'default'
          },
          '& .rd3t-svg': {
            overflow: 'visible'
          }
        }}
      >
        {layout ? (
          <Tree
            data={treeData}
            orientation='vertical'
            pathFunc='diagonal'
            dimensions={{ width: layout.width, height: layout.height }}
            translate={layout.translate}
            nodeSize={{ x: NODE_SIZE_X, y: NODE_SIZE_Y }}
            separation={{ siblings: 1.15, nonSiblings: 1.3 }}
            renderCustomNodeElement={renderNode}
            zoomable
            draggable
            scaleExtent={{ min: 0.45, max: 1.6 }}
            collapsible={false}
            enableLegacyTransitions={false}
          />
        ) : null}
      </Box>
      {truncated ? (
        <Typography variant='caption' color='text.secondary' sx={{ display: 'block', textAlign: 'center', py: 1.5 }}>
          به‌دلیل حجم زیاد، فقط بخشی از درخت نمایش داده شده است.
        </Typography>
      ) : null}
    </Box>
  )
}

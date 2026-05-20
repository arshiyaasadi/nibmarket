'use client'

// ** React Imports
import { Suspense, useMemo, useLayoutEffect, useRef, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

// ** Hooks
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Types for network tree
interface NetworkNode {
  id: string
  name: string
  family: string
  balance: string | number
  networks: NetworkNode[]
}

interface Edge {
  parentId: string
  childId: string
}

// ** BFS helper to flatten nested network structure into levels
const buildNetworkLevels = (root: NetworkNode): { edges: Edge[] } => {
  const edges: Edge[] = []

  const queue: Array<{ node: NetworkNode; parentId: string | null }> = [
    { node: root, parentId: null }
  ]

  while (queue.length > 0) {
    const { node, parentId } = queue.shift() as {
      node: NetworkNode
      parentId: string | null
    }

    if (node.networks && node.networks.length > 0) {
      node.networks.forEach(child => {
        queue.push({ node: child, parentId: node.id })
        edges.push({ parentId: node.id, childId: child.id })
      })
    }
  }

  return { edges }
}

// ** Network Tree Visualization Component
const NetworkTree = ({ root }: { root: NetworkNode }) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [lines, setLines] = useState<
    { parentId: string; childId: string; fromX: number; fromY: number; toX: number; toY: number }[]
  >([])

  const { edges } = useMemo(() => buildNetworkLevels(root), [root])

  // Compute SVG connector positions after layout
  useLayoutEffect(() => {
    const containerEl = containerRef.current
    if (!containerEl) return

    const recomputeLines = () => {
      if (!containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const newLines: {
        parentId: string
        childId: string
        fromX: number
        fromY: number
        toX: number
        toY: number
      }[] = []

      edges.forEach(edge => {
        const parentEl = nodeRefs.current[edge.parentId]
        const childEl = nodeRefs.current[edge.childId]

        if (!parentEl || !childEl) {
          return
        }

        const parentRect = parentEl.getBoundingClientRect()
        const childRect = childEl.getBoundingClientRect()

        const fromX = parentRect.left + parentRect.width / 2 - containerRect.left
        const fromY = parentRect.bottom - containerRect.top
        const toX = childRect.left + childRect.width / 2 - containerRect.left
        const toY = childRect.top - containerRect.top

        newLines.push({
          parentId: edge.parentId,
          childId: edge.childId,
          fromX,
          fromY,
          toX,
          toY
        })
      })

      setLines(newLines)
    }

    // Initial computation
    recomputeLines()

    // Recompute on window resize
    const handleResize = () => {
      recomputeLines()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)
    }

    // Recompute when the container itself resizes (layout shifts)
    let resizeObserver: ResizeObserver | undefined
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        recomputeLines()
      })
      resizeObserver.observe(containerEl)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize)
      }
      if (resizeObserver && containerEl) {
        resizeObserver.unobserve(containerEl)
        resizeObserver.disconnect()
      }
    }
  }, [edges])

  const renderCard = (node: NetworkNode, isRoot: boolean) => {
    const fullName = `${node.name} ${node.family}`.trim()

    return (
      <Box
        ref={el => {
          nodeRefs.current[node.id] = el as HTMLDivElement | null
        }}
        sx={{
          position: 'relative',
          zIndex: 2,
          width: 180,
          aspectRatio: '4 / 3'
        }}
      >
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: theme => theme.shadows[4],
            border: theme => `1px solid ${theme.palette.divider}`,
            backgroundColor: theme => theme.palette.background.paper,
            color: 'text.primary',
            height: '100%'
          }}
        >
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              height: '100%',
              py: 2,
              px: 3,
              textAlign: 'center'
            }}
          >
            <Typography
              variant='subtitle1'
              sx={{
                fontWeight: 700,
                mb: 0.5
              }}
            >
              {fullName}
            </Typography>
            <Typography
              variant='body2'
              sx={{
                fontWeight: 600
              }}
            >
              {typeof node.balance === 'number'
                ? node.balance.toLocaleString('fa-IR')
                : Number(node.balance).toLocaleString('fa-IR')}{' '}
              تومان
            </Typography>
          </CardContent>
        </Card>
      </Box>
    )
  }

  const renderSubtree = (node: NetworkNode, isRoot: boolean) => {
    const hasChildren = node.networks && node.networks.length > 0

    return (
      <Box
        key={node.id}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          px: 3,
          py: 2
        }}
      >
        {renderCard(node, isRoot)}
        {hasChildren && (
          <Box
            sx={{
              mt: 4,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              gap: 4,
              flexWrap: 'nowrap'
            }}
          >
            {node.networks.map(child => renderSubtree(child, false))}
          </Box>
        )}
      </Box>
    )
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: 400,
        py: 6,
        overflow: 'auto'
      }}
    >
      {/* SVG connectors behind cards */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none'
        }}
      >
        <svg width='100%' height='100%'>
          {lines.map(line => {
            const midY = (line.fromY + line.toY) / 2
            const path = `M ${line.fromX},${line.fromY} C ${line.fromX},${midY} ${line.toX},${midY} ${line.toX},${line.toY}`

            return (
              <path
                key={`${line.parentId}-${line.childId}`}
                d={path}
                stroke='#D1D5DB'
                strokeWidth={2}
                fill='none'
              />
            )
          })}
        </svg>
      </Box>

      {/* Recursive tree layout */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        {renderSubtree(root, true)}
      </Box>
    </Box>
  )
}

const SubsetTreePageContent = () => {
  const { settings } = useSettings()
  const direction = settings.direction || 'rtl'

  // Example mock data - each node has at least 2 children
  const rootNode: NetworkNode = useMemo(
    () => ({
      id: '1',
      name: 'علی',
      family: 'احمدی',
      balance: 5000000,
      networks: [
        {
          id: '2',
          name: 'محمد',
          family: 'رضایی',
          balance: 3000000,
          networks: [
            {
              id: '4',
              name: 'حسن',
              family: 'کریمی',
              balance: 1500000,
              networks: [
              ]
            },
            {
              id: '5',
              name: 'سارا',
              family: 'رضایی',
              balance: 1100000,
              networks: []
            }
          ]
        },
        {
          id: '3',
          name: 'رضا',
          family: 'محمدی',
          balance: 2500000,
          networks: [
            {
              id: '13',
              name: 'الهام',
              family: 'صبوری',
              balance: 1200000,
              networks: [
                {
                  id: '14',
                  name: 'نگین',
                  family: 'صبوری',
                  balance: 510000,
                  networks: [
                    {
                      id: '15',
                      name: 'سارا',
                      family: 'رضایی',
                      balance: 1100000,
                      networks: []
                    },
                    {
                      id: '16',
                      name: 'سارا',
                      family: 'رضایی',
                      balance: 1100000,
                      networks: []
                    }]
                }
              ]
            }
          ]
        }
      ]
    }),
    []
  )

  return (
    <Box dir={direction}>
      <Typography variant='h4' sx={{ mb: 4 }}>
        درخت زیر مجموعه
      </Typography>
      <Card>
        <CardContent sx={{ p: theme => `${theme.spacing(5)} !important` }}>
          <NetworkTree root={rootNode} />
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

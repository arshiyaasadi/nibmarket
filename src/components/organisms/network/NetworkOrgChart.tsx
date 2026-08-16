'use client'

import { useLayoutEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from 'react'
import { Minus, Plus, Network, UserPlus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { VipInviteButton } from '@/components/molecules/VipInviteButton'
import OrgTree from 'react-d3-tree'
import type { CustomNodeElementProps, RawNodeDatum, TreeProps } from 'react-d3-tree'

import type { NetworkTreeNode } from '@/types/mlm'
import { cn } from '@/lib/utils'

const Tree = OrgTree as ComponentType<TreeProps>

type Props = {
  root: NetworkTreeNode | null
  truncated?: boolean
  minHeight?: number
  interactive?: boolean
  initialZoom?: number
  embedded?: boolean
  fillContainer?: boolean
  showZoomControls?: boolean
  compactEmpty?: boolean
  tightEmpty?: boolean
  showEmptyInvite?: boolean
  onInvite?: () => void
  onRegisterReferrer?: () => void
  canRegisterReferrer?: boolean
  emptyState?: ReactNode
}

function toD3Datum(node: NetworkTreeNode): RawNodeDatum {
  return {
    name: node.fullName,
    attributes: {
      isSelf: node.isSelf ? '1' : '0',
      level: String(node.level),
    },
    children: (node.children?.length ?? 0) > 0 ? node.children!.map(toD3Datum) : undefined,
  }
}

type NodeColors = {
  primaryMain: string
  primaryDark: string
  textPrimary: string
  textSecondary: string
}

/**
 * The label box is wide on purpose and its text is right-aligned, so the name grows
 * leftwards from a fixed edge instead of being clipped to a narrow box.
 */
const LABEL_BOX_WIDTH = 220
const LABEL_GAP = 12
const LABEL_SHIFT = 34
const NODE_SIZE_X = 164
const NODE_SIZE_Y = 64
const MAX_NAME_CHARS = 22

function getTreeDepth(node: NetworkTreeNode): number {
  if (!node.children?.length) return 1
  return 1 + Math.max(...node.children.map(getTreeDepth))
}

function computeFitZoom(
  width: number,
  height: number,
  treeDepth: number,
  embedded: boolean,
): number {
  const estimatedTreeHeight = treeDepth * NODE_SIZE_Y
  const heightZoom = (height - 32) / estimatedTreeHeight
  const widthZoom = (width - 48) / Math.max(NODE_SIZE_X * 1.5, 160)
  const fit = Math.min(heightZoom, widthZoom)
  const clamped = Math.max(0.45, Math.min(1.15, fit))

  if (embedded && treeDepth <= 2) {
    return Math.max(clamped, 0.82)
  }
  if (embedded) {
    return Math.max(clamped, 0.62)
  }
  return Math.max(clamped, 0.68)
}

function truncateName(name: string): string {
  if (name.length <= MAX_NAME_CHARS) return name
  return `${name.slice(0, MAX_NAME_CHARS - 1)}…`
}

function renderOrgChartNode(colors: NodeColors, selfLabel: string, levelLabel: (n: string) => string) {
  return function OrgChartNode({ nodeDatum }: CustomNodeElementProps) {
    const isSelf = nodeDatum.attributes?.isSelf === '1'
    const level = nodeDatum.attributes?.level
    const showLevel = Boolean(level && level !== '0')

    const radius = isSelf ? 9 : 7
    const displayName = truncateName(String(nodeDatum.name || '—'))
    const subtitle = isSelf ? selfLabel : showLevel ? levelLabel(String(level)) : null
    // The box ends one gap before the dot, so text never touches the branch joint.
    const labelX = -(LABEL_BOX_WIDTH + LABEL_GAP + radius)
    const labelHeight = subtitle ? 36 : 20

    return (
      <g className='network-org-node'>
        <circle
          r={radius}
          cy={0}
          fill={isSelf ? colors.primaryMain : '#9ca3af'}
          stroke='none'
        />
        <foreignObject
          x={labelX}
          y={-labelHeight / 2}
          width={LABEL_BOX_WIDTH}
          height={labelHeight}
          style={{ overflow: 'visible' }}
        >
          {/*
            The wrapper stays LTR so `flex-end` resolves to the right edge — under RTL
            it would flip to the left and clip the name against the narrow side.
          */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-end',
              gap: 1,
              width: '100%',
              height: '100%',
              direction: 'ltr',
              lineHeight: 1.35,
              pointerEvents: 'none',
              fontFamily: 'IRANSans, system-ui, sans-serif',
            }}
          >
            <span
              style={{
                maxWidth: '100%',
                direction: 'rtl',
                textAlign: 'right',
                fontSize: 12,
                fontWeight: 400,
                color: isSelf ? colors.primaryDark : colors.textPrimary,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {displayName}
            </span>
            {subtitle ? (
              <span
                style={{
                  direction: 'rtl',
                  textAlign: 'right',
                  fontSize: 10,
                  fontWeight: 300,
                  color: isSelf ? colors.primaryMain : colors.textSecondary,
                  whiteSpace: 'nowrap',
                }}
              >
                {subtitle}
              </span>
            ) : null}
          </div>
        </foreignObject>
      </g>
    )
  }
}

function resolveCssVar(el: HTMLElement, variable: string, fallback: string): string {
  return getComputedStyle(el).getPropertyValue(variable).trim() || fallback
}

function NetworkTreeEmptyState({
  onInvite,
  onRegisterReferrer,
  canRegisterReferrer,
  compact = false,
  tight = false,
  showInvite = true,
}: {
  onInvite?: () => void
  onRegisterReferrer?: () => void
  canRegisterReferrer?: boolean
  compact?: boolean
  tight?: boolean
  showInvite?: boolean
}) {
  const t = useTranslations('network')
  const showRegister = canRegisterReferrer && onRegisterReferrer

  return (
    <div
      className={cn(
        'flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3',
        compact ? 'px-0 py-0' : tight ? 'px-0 py-1' : 'px-1 py-4 sm:py-5',
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5 text-start sm:gap-3">
        <div
          className={cn(
            'flex shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15',
            compact ? 'size-9' : 'size-10 sm:size-11',
          )}
        >
          <Network className={cn('text-primary', compact ? 'size-4' : 'size-5 sm:size-6')} strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className={cn('font-semibold text-foreground', compact ? 'text-xs sm:text-sm' : 'text-sm')}>
            {t('noSubsetsTitle')}
          </p>
          {!compact && (
            <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted">{t('noSubsetsDesc')}</p>
          )}
          {compact && (
            <p className="mt-0.5 hidden text-[12px] leading-snug text-muted sm:line-clamp-1 sm:block">
              {t('noSubsetsDesc')}
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
        {showInvite && onInvite && (
          <VipInviteButton
            onClick={onInvite}
            fullWidth={false}
            className={cn(
              'min-w-[10.5rem] flex-1 sm:flex-none',
              compact && 'px-3 py-2 text-xs',
            )}
          />
        )}
        {showRegister && (
          <button
            type="button"
            onClick={onRegisterReferrer}
            className={cn(
              'inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-primary/30 bg-primary/5 font-medium text-primary transition hover:bg-primary/10 sm:flex-none',
              compact ? 'min-h-[3.25rem] px-3 py-2 text-xs' : 'px-4 py-2.5 text-xs sm:px-5 sm:text-sm',
            )}
          >
            <UserPlus className={compact ? 'size-3.5' : 'size-3.5 sm:size-4'} />
            {t('registerReferrerBtn')}
          </button>
        )}
      </div>
    </div>
  )
}

export default function NetworkOrgChart({
  root,
  truncated = false,
  minHeight = 420,
  interactive = true,
  initialZoom,
  embedded = false,
  fillContainer = false,
  showZoomControls = false,
  compactEmpty = false,
  tightEmpty = false,
  showEmptyInvite = true,
  onInvite,
  onRegisterReferrer,
  canRegisterReferrer = false,
  emptyState,
}: Props) {
  const t = useTranslations('network')
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [zoom, setZoom] = useState(0.75)
  const [layout, setLayout] = useState<{
    width: number
    height: number
    translate: { x: number; y: number }
    colors: NodeColors
  } | null>(null)

  const treeData = useMemo(() => (root ? toD3Datum(root) : null), [root])
  const treeDepth = useMemo(() => (root ? getTreeDepth(root) : 1), [root])
  const hasNoSubsets = Boolean(root && !(root.children?.length ?? 0))

  const levelLabel = useMemo(
    () => (level: string) => t('treeLevel', { level }),
    [t],
  )

  const renderNode = useMemo(
    () =>
      layout
        ? renderOrgChartNode(layout.colors, t('treeSelfLabel'), levelLabel)
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      layout?.colors.primaryMain,
      layout?.colors.primaryDark,
      layout?.colors.textPrimary,
      layout?.colors.textSecondary,
      levelLabel,
      t,
    ],
  )

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el || !treeData) return

    let raf = 0

    const update = () => {
      const { width, height } = el.getBoundingClientRect()
      if (width <= 0 || height <= 0) {
        raf = requestAnimationFrame(update)
        return
      }

      const fitZoom = initialZoom ?? computeFitZoom(width, height, treeDepth, embedded)
      const estimatedTreeHeight = treeDepth * NODE_SIZE_Y
      // Labels hang to the left of every dot, so the tree is nudged right to stay centred.
      const labelOffset = LABEL_SHIFT
      const translateY = Math.max(24, (height - estimatedTreeHeight * fitZoom) / 2 + 20)
      const translateX = width / 2 + labelOffset

      const colors: NodeColors = {
        primaryMain: resolveCssVar(el, '--color-primary', '#7c3aed'),
        primaryDark: resolveCssVar(el, '--color-primary', '#6d28d9'),
        textPrimary: resolveCssVar(el, '--color-foreground', '#111827'),
        textSecondary: resolveCssVar(el, '--color-muted', '#6b7280'),
      }

      setLayout({ width, height, translate: { x: translateX, y: translateY }, colors })
      setZoom(fitZoom)
    }

    update()

    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null
    observer?.observe(el)

    return () => {
      if (raf) cancelAnimationFrame(raf)
      observer?.disconnect()
    }
  }, [treeData, treeDepth, embedded, initialZoom, root?.id])

  if (!treeData) {
    return (
      <div
        className="flex w-full items-center justify-center text-sm text-muted"
        style={{ minHeight }}
      >
        {t('treeEmpty')}
      </div>
    )
  }

  if (hasNoSubsets) {
    return (
      <div
        className={cn(
          'flex w-full items-center justify-center',
          embedded ? 'min-h-0 flex-1' : 'rounded-2xl bg-surface',
        )}
      >
        {emptyState ?? (
          <NetworkTreeEmptyState
            onInvite={onInvite}
            onRegisterReferrer={onRegisterReferrer}
            canRegisterReferrer={canRegisterReferrer}
            compact={compactEmpty}
            tight={tightEmpty}
            showInvite={showEmptyInvite}
          />
        )}
      </div>
    )
  }

  const chartHeight = fillContainer ? '100%' : minHeight

  return (
    <div
      className={`relative flex w-full flex-col ${fillContainer ? 'min-h-0 flex-1' : ''} ${embedded ? '' : 'rounded-2xl bg-surface'}`}
      style={{ minHeight: fillContainer ? undefined : minHeight }}
    >
      <div
        ref={containerRef}
        className="w-full overflow-hidden"
        style={{
          minHeight: chartHeight,
          height: chartHeight,
          direction: 'ltr',
          cursor: interactive ? 'grab' : 'default',
          touchAction: interactive ? 'none' : 'auto',
        }}
      >
        <style>{`
          .rd3t-tree-container { width: 100%; height: 100%; }
          .rd3t-link { stroke: #c4c9d2; stroke-width: 1.25px; }
          .network-org-node foreignObject { overflow: visible; }
          .network-org-node foreignObject div { -webkit-font-smoothing: antialiased; }
          .rd3t-node, .rd3t-leaf-node { fill: none; stroke: none; cursor: default; }
          .rd3t-svg { overflow: visible; }
          ${interactive ? '.rd3t-tree-container:active { cursor: grabbing; }' : '.rd3t-tree-container { pointer-events: none; }'}
        `}</style>
        {layout && renderNode ? (
          <Tree
            data={treeData}
            orientation='vertical'
            pathFunc='diagonal'
            dimensions={{ width: layout.width, height: layout.height }}
            translate={layout.translate}
            nodeSize={{ x: NODE_SIZE_X, y: NODE_SIZE_Y }}
            separation={{ siblings: 1.15, nonSiblings: 1.3 }}
            renderCustomNodeElement={renderNode}
            zoom={zoom}
            zoomable={interactive}
            draggable={interactive}
            scaleExtent={{ min: 0.35, max: 1.8 }}
            collapsible={false}
            enableLegacyTransitions={false}
            onUpdate={(target) => {
              if (interactive && typeof target.zoom === 'number') {
                setZoom(target.zoom)
              }
            }}
          />
        ) : null}
      </div>

      {showZoomControls && (
        <div className="absolute bottom-3 start-3 z-10 flex flex-col gap-1">
          <button
            type="button"
            aria-label={t('treeZoomIn')}
            onClick={() => setZoom((z) => Math.min(z + 0.12, 1.8))}
            className="flex size-8 items-center justify-center rounded-lg border border-border bg-surface/95 shadow-sm text-foreground backdrop-blur-sm hover:bg-surface-2"
          >
            <Plus className="size-4" />
          </button>
          <button
            type="button"
            aria-label={t('treeZoomOut')}
            onClick={() => setZoom((z) => Math.max(z - 0.12, 0.35))}
            className="flex size-8 items-center justify-center rounded-lg border border-border bg-surface/95 shadow-sm text-foreground backdrop-blur-sm hover:bg-surface-2"
          >
            <Minus className="size-4" />
          </button>
        </div>
      )}

      {truncated ? (
        <p className="py-3 text-center text-xs text-muted">
          {t('treeTruncated')}
        </p>
      ) : null}
    </div>
  )
}

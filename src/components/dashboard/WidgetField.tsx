'use client'

import { ReactNode } from 'react'

import Skeleton from '@mui/material/Skeleton'

type WidgetFieldProps = {
  ready: boolean
  children?: ReactNode
  width?: number | string
  height?: number
}

/** Placeholder skeleton for values when API data is not ready */
export default function WidgetField({ ready, children, width = 100, height = 28 }: WidgetFieldProps) {
  if (!ready) {
    return <Skeleton variant='rounded' width={width} height={height} animation={false} sx={{ flexShrink: 0 }} />
  }

  return <>{children}</>
}

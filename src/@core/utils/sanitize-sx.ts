import type { SxProps, Theme } from '@mui/material/styles'

/** RGB triplet (e.g. theme customColors.main) — invalid for MUI color parser unless wrapped */
export function isInvalidMuiColorValue(value: unknown): boolean {
  if (typeof value !== 'string') return false
  const trimmed = value.trim()
  if (trimmed.startsWith('#') || trimmed.startsWith('rgb') || trimmed.startsWith('hsl')) {
    return false
  }
  if (/^[\d\s,]+$/.test(trimmed) && trimmed.includes(',')) {
    return true
  }

  return false
}

/** Wrap bare RGB triplet as valid CSS color */
export function coerceCssColor(value: unknown): unknown {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  if (isInvalidMuiColorValue(trimmed)) {
    return `rgb(${trimmed})`
  }

  return value
}

const COLOR_STYLE_KEYS = new Set([
  'color',
  'backgroundColor',
  'borderColor',
  'borderTopColor',
  'borderRightColor',
  'borderBottomColor',
  'borderLeftColor',
  'outlineColor',
  'fill',
  'stroke'
])

function sanitizeStyleObject(record: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(record)) {
    if (COLOR_STYLE_KEYS.has(key)) {
      out[key] = coerceCssColor(value)
      continue
    }

    if (key.startsWith('&') || key.startsWith('@') || key === ':hover' || key === ':focus' || key.startsWith(':')) {
      if (typeof value === 'object' && value != null && !Array.isArray(value)) {
        out[key] = sanitizeStyleObject(value as Record<string, unknown>)
      } else {
        out[key] = value
      }
      continue
    }

    if (typeof value === 'object' && value != null && !Array.isArray(value)) {
      out[key] = sanitizeStyleObject(value as Record<string, unknown>)
    } else {
      out[key] = value
    }
  }

  return out
}

export function sanitizeSxColors(sx?: SxProps<Theme>): SxProps<Theme> | undefined {
  if (sx == null) return sx
  if (typeof sx === 'function') return sx

  if (Array.isArray(sx)) {
    return sx.map(item => sanitizeSxColors(item)).filter(item => item != null) as SxProps<Theme>
  }

  if (typeof sx === 'object') {
    return sanitizeStyleObject({ ...sx } as Record<string, unknown>) as SxProps<Theme>
  }

  return sx
}

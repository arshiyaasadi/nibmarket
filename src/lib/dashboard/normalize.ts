import { safeThemeColor } from 'src/@core/utils/safe-theme-color'
import type { ThemeColor } from 'src/@core/layouts/types'

export function normalizeThemeColor(value: unknown, fallbackIndex = 0): ThemeColor {
  return safeThemeColor(value, fallbackIndex)
}

export function normalizeTrend(value: unknown): 'positive' | 'negative' {
  if (value === 'negative' || value === false) return 'negative'

  return 'positive'
}

export function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && !Number.isNaN(value)) return value
  if (typeof value === 'string') {
    const n = Number(value.replace(/,/g, ''))
    if (!Number.isNaN(n)) return n
  }

  return fallback
}

export function toString(value: unknown, fallback = ''): string {
  if (value == null) return fallback
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)

  return fallback
}

export function ensureArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

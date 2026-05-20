import type { ThemeColor } from 'src/@core/layouts/types'

const THEME_COLORS: ThemeColor[] = ['primary', 'secondary', 'success', 'error', 'warning', 'info']

/**
 * Maps API/unknown color strings to MUI ThemeColor.
 * Prevents passing values like "76, 78, 100" to MUI components.
 */
export function safeThemeColor(value: unknown, fallbackIndex = 0): ThemeColor {
  if (typeof value === 'string') {
    const trimmed = value.trim().toLowerCase()
    if (THEME_COLORS.includes(trimmed as ThemeColor)) {
      return trimmed as ThemeColor
    }
    if (/^[\d\s,]+$/.test(trimmed) || trimmed.startsWith('rgb')) {
      return THEME_COLORS[fallbackIndex % THEME_COLORS.length]
    }
  }

  return THEME_COLORS[fallbackIndex % THEME_COLORS.length]
}

export function isThemeColor(value: unknown): value is ThemeColor {
  return typeof value === 'string' && THEME_COLORS.includes(value as ThemeColor)
}

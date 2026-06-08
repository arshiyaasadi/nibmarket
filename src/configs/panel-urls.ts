/**
 * External Nibmarket panel (legacy user profile / account UI).
 * Template stays on club app; profile & settings open these URLs.
 */
const trimTrailingSlash = (url: string) => url.replace(/\/$/, '')

export const PANEL_BASE_URL =
  process.env.NEXT_PUBLIC_PANEL_BASE_URL?.replace(/\/$/, '') || 'https://panel.nibdev.com'

export const PANEL_PROFILE_URL =
  process.env.NEXT_PUBLIC_PANEL_PROFILE_URL || `${PANEL_BASE_URL}/profile/`

export const PANEL_USER_ACCOUNT_URL =
  process.env.NEXT_PUBLIC_PANEL_USER_ACCOUNT_URL || `${PANEL_BASE_URL}/user-account/`

export function panelProfileHref(): string {
  return trimTrailingSlash(PANEL_PROFILE_URL) + '/'
}

export function panelUserAccountHref(): string {
  return trimTrailingSlash(PANEL_USER_ACCOUNT_URL) + '/'
}

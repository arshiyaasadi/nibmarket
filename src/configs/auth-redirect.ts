import { clearEntryToken, clearSessionTokens } from 'src/lib/auth-token'

/** External Nib panel SSO login — used when session is missing or expired. */
export const PANEL_LOGIN_URL =
  process.env.NEXT_PUBLIC_PANEL_LOGIN_URL?.trim() ||
  'https://panel.nibdev.com/login?callback_service=mlm'

export function clearAuthTokens(): void {
  clearSessionTokens()
  clearEntryToken()
}

/** Clear local session and navigate to panel login (full page — external origin). */
export function redirectToPanelLogin(): void {
  if (typeof window === 'undefined') return

  clearAuthTokens()
  window.location.href = PANEL_LOGIN_URL
}

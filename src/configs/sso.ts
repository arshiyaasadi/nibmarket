export const SSO_LOGIN_PATH = '/login/sso'

export const PANEL_BASE_URL =
  process.env.NEXT_PUBLIC_PANEL_BASE_URL?.trim() || 'https://panel.nibdev.com'

const DEFAULT_APP_ORIGIN = 'https://club.nibdev.com'

/** Club app origin — env on server, window.origin in browser. */
export function resolveAppOrigin(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.NEXT_PUBLIC_HOST_URL?.trim()

  return fromEnv?.replace(/\/$/, '') || DEFAULT_APP_ORIGIN
}

/** Panel redirect target after SSO login (`callbackUrl` query param). */
export function getSsoCallbackUrl(options?: { referred?: boolean }): string {
  const base = `${resolveAppOrigin()}${SSO_LOGIN_PATH}`

  if (options?.referred) {
    return `${base}?referred`
  }

  return `${base}/`
}

/**
 * Panel login URL with `callbackUrl` always as the last query parameter.
 * Referral signups use `callbackUrl=.../login/sso?referred`.
 */
export function buildPanelSsoLoginUrl(referralCode?: string): string {
  const url = new URL('/login/', PANEL_BASE_URL)
  const code = referralCode?.trim()

  if (code) {
    url.searchParams.set('referral_code', code)
  }

  url.searchParams.set('callbackUrl', getSsoCallbackUrl({ referred: Boolean(code) }))

  return url.toString()
}

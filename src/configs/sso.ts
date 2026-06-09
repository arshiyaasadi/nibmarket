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
 * `callbackUrl` is appended without encoding — the panel expects a readable absolute URL.
 */
export function buildPanelSsoLoginUrl(referralCode?: string): string {
  const code = referralCode?.trim()
  const callbackUrl = getSsoCallbackUrl({ referred: Boolean(code) })
  const loginBase = `${PANEL_BASE_URL.replace(/\/$/, '')}/login/?`

  if (code) {
    return `${loginBase}referral_code=${encodeURIComponent(code)}&callbackUrl=${callbackUrl}`
  }

  return `${loginBase}callbackUrl=${callbackUrl}`
}

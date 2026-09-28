import { LEGACY_LOCAL_LOGIN_ENABLED } from "@/config/auth-flow";
import { getPanelLoginUrl } from "@/config/sso";
import { ROUTES } from "@/config/routes";

const SSO_RETURN_URL_KEY = "sso_returnUrl";

export function sanitizeReturnUrl(value: string | null | undefined): string {
  if (!value) return ROUTES.DASHBOARD;
  if (!value.startsWith("/") || value.startsWith("//")) return ROUTES.DASHBOARD;
  if (value.startsWith("/login")) return ROUTES.DASHBOARD;
  if (value.startsWith("/session-expired")) return ROUTES.DASHBOARD;
  return value;
}

export function storeReturnUrl(returnUrl?: string): void {
  try {
    sessionStorage.setItem(SSO_RETURN_URL_KEY, sanitizeReturnUrl(returnUrl));
  } catch {
    // ignore storage errors (private mode, etc.)
  }
}

export function resolveReturnUrl(fallback?: string | null): string {
  try {
    const stored = sessionStorage.getItem(SSO_RETURN_URL_KEY);
    if (stored) {
      sessionStorage.removeItem(SSO_RETURN_URL_KEY);
      return sanitizeReturnUrl(stored);
    }
  } catch {
    // ignore storage errors
  }
  return sanitizeReturnUrl(fallback);
}

/**
 * Start NIB Market SSO (panel.nibdev.com / panel.nibmarket.com).
 * Callback URL is this club panel (`NEXT_PUBLIC_APP_URL` + `/login/sso/`), not the backend API.
 */
export function redirectToPanelLogin(returnUrl?: string): void {
  storeReturnUrl(returnUrl);
  window.location.href = getPanelLoginUrl();
}

export function buildLoginRedirectUrl(returnUrl?: string): string {
  const safeReturnUrl = sanitizeReturnUrl(returnUrl);
  if (safeReturnUrl === ROUTES.DASHBOARD) return ROUTES.LOGIN;

  const params = new URLSearchParams({
    returnUrl: safeReturnUrl,
    redirect: safeReturnUrl,
  });
  return `${ROUTES.LOGIN}?${params.toString()}`;
}

export function buildSessionExpiredUrl(returnUrl?: string): string {
  const safeReturnUrl = sanitizeReturnUrl(returnUrl);
  if (safeReturnUrl === ROUTES.DASHBOARD) return ROUTES.SESSION_EXPIRED;

  const params = new URLSearchParams({
    returnUrl: safeReturnUrl,
    redirect: safeReturnUrl,
  });
  return `${ROUTES.SESSION_EXPIRED}?${params.toString()}`;
}

/**
 * After API 401 / session expiry: stay on club and show expired page.
 * Do NOT auto-bounce to panel SSO (avoids club ↔ NIB redirect loops).
 */
export function redirectToSessionExpired(returnUrl?: string): void {
  window.location.href = buildSessionExpiredUrl(returnUrl);
}

/**
 * Intentional local login entry (legacy OTP) or SSO when legacy is offline.
 * Prefer redirectToSessionExpired for 401 handling.
 */
export function redirectToLocalLogin(returnUrl?: string): void {
  if (!LEGACY_LOCAL_LOGIN_ENABLED) {
    redirectToSessionExpired(returnUrl);
    return;
  }
  window.location.href = buildLoginRedirectUrl(returnUrl);
}

/** Landing / CTA entry — always external SSO while legacy login is offline. */
export function startAuthEntry(returnUrl: string = ROUTES.DASHBOARD): void {
  redirectToPanelLogin(returnUrl);
}

import { getPanelLoginUrl } from "@/config/sso";
import { ROUTES } from "@/config/routes";

const SSO_RETURN_URL_KEY = "sso_returnUrl";

export function sanitizeReturnUrl(value: string | null | undefined): string {
  if (!value) return ROUTES.DASHBOARD;
  if (!value.startsWith("/") || value.startsWith("//")) return ROUTES.DASHBOARD;
  if (value.startsWith("/login")) return ROUTES.DASHBOARD;
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

export function redirectToPanelLogin(returnUrl?: string): void {
  // UI_DEV_MODE keeps the developer inside the local app — never bounce to NIB panel.
  if (process.env.NEXT_PUBLIC_UI_DEV_MODE === "1") {
    redirectToLocalLogin(returnUrl);
    return;
  }

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

/** Local login page — use after logout or session expiry (not external SSO). */
export function redirectToLocalLogin(returnUrl?: string): void {
  window.location.href = buildLoginRedirectUrl(returnUrl);
}

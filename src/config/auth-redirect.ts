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
  storeReturnUrl(returnUrl);
  window.location.href = getPanelLoginUrl();
}

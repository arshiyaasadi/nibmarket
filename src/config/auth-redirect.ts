import { getPanelLoginUrl } from "@/config/sso";
import { ROUTES } from "@/config/routes";

export function sanitizeReturnUrl(value: string | null | undefined): string {
  if (!value) return ROUTES.DASHBOARD;
  if (!value.startsWith("/") || value.startsWith("//")) return ROUTES.DASHBOARD;
  if (value.startsWith("/login")) return ROUTES.DASHBOARD;
  return value;
}

export function redirectToPanelLogin(returnUrl?: string): void {
  window.location.href = getPanelLoginUrl(sanitizeReturnUrl(returnUrl));
}

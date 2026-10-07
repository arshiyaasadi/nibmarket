import { clearQueryCache, getQueryClient } from "@/lib/query-client";
import { BFF_API_BASE } from "@/lib/api/endpoints";
import { ROUTES } from "@/config/routes";
import { getPanelLoginUrlBare } from "@/config/sso";
import { clearNibmarketSsoCookies } from "@/lib/auth/clear-nibmarket-cookies";
import { useAuthSlice } from "@/store/slices/auth.slice";
import { useUiSlice } from "@/store/slices/ui.slice";

type LogoutApiResult = {
  ok: boolean;
  clubLoggedOut?: boolean;
  reason?: string | null;
};

/** Clears in-memory API cache and client auth state (no network call). */
export function clearSessionLocally(): void {
  getQueryClient().cancelQueries();
  clearQueryCache();
  useUiSlice.getState().closeModal();
  useAuthSlice.getState().clearAuth();
}

function redirectToLogoutIncomplete(reason: string): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams();
  if (reason) params.set("reason", reason);
  const qs = params.toString();
  window.location.href = qs ? `${ROUTES.LOGOUT_INCOMPLETE}?${qs}` : ROUTES.LOGOUT_INCOMPLETE;
}

function redirectToPanelLoginAfterLogout(): void {
  if (typeof window === "undefined") return;
  // Panel SSO without callbackUrl
  window.location.href = getPanelLoginUrlBare();
}

/**
 * 1) POST BFF /auth/logout (server → NIB auth)
 * 2) Only after a response: clear local club session
 * 3) Success → panel login with callbackUrl; failure → incomplete page + retry
 */
export async function performLogout(): Promise<void> {
  getQueryClient().cancelQueries();

  let result: LogoutApiResult | null = null;
  let networkFailed = false;

  try {
    const res = await fetch(`${BFF_API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    result = (await res.json().catch(() => null)) as LogoutApiResult | null;
    if (!res.ok || !result?.ok) {
      result = {
        ok: false,
        clubLoggedOut: result?.clubLoggedOut ?? true,
        reason:
          result?.reason?.trim() ||
          (res.ok ? "خروج از سرویس احراز هویت ناموفق بود." : `خطای سرور کلاب (${res.status}).`),
      };
    }
  } catch {
    networkFailed = true;
    result = {
      ok: false,
      clubLoggedOut: false,
      reason: "ارتباط با سرور کلاب برقرار نشد.",
    };
  }

  // Logout locally only after the API responded (or the request failed).
  clearSessionLocally();
  // Nibmarket team: clear shared-domain SSO cookies from the client as well.
  clearNibmarketSsoCookies();

  if (typeof window === "undefined") return;

  if (result?.ok) {
    redirectToPanelLoginAfterLogout();
    return;
  }

  redirectToLogoutIncomplete(
    result?.reason?.trim() ||
      (networkFailed ? "ارتباط با سرور کلاب برقرار نشد." : "خروج از سرویس احراز هویت ناموفق بود."),
  );
}

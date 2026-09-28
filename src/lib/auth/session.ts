import { clearQueryCache, getQueryClient } from "@/lib/query-client";
import { BFF_API_BASE } from "@/lib/api/endpoints";
import { ROUTES } from "@/config/routes";
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
  window.location.href = qs
    ? `${ROUTES.LOGOUT_INCOMPLETE}?${qs}`
    : ROUTES.LOGOUT_INCOMPLETE;
}

/**
 * Logout via BFF: browser → club server → NIB auth log_out.
 * On success: clear local session and go home.
 * On service/network error: clear local UI session and show incomplete page with retry.
 */
export async function performLogout(redirectTo: string = ROUTES.HOME): Promise<void> {
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

  // After any response (or network failure), end the in-app club session.
  clearSessionLocally();

  if (typeof window === "undefined") return;

  if (result?.ok) {
    window.location.href = redirectTo;
    return;
  }

  redirectToLogoutIncomplete(
    result?.reason?.trim() ||
      (networkFailed
        ? "ارتباط با سرور کلاب برقرار نشد."
        : "خروج از سرویس احراز هویت ناموفق بود."),
  );
}

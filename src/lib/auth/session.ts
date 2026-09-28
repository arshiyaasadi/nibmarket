import { clearQueryCache, getQueryClient } from "@/lib/query-client";
import { BFF_API_BASE } from "@/lib/api/endpoints";
import { ROUTES } from "@/config/routes";
import { useAuthSlice } from "@/store/slices/auth.slice";
import { useUiSlice } from "@/store/slices/ui.slice";

/** Clears in-memory API cache and client auth state (no network call). */
export function clearSessionLocally(): void {
  getQueryClient().cancelQueries();
  clearQueryCache();
  useUiSlice.getState().closeModal();
  useAuthSlice.getState().clearAuth();
}

/**
 * Logout via BFF (server calls NIB auth log_out + clears httpOnly cookies).
 * Default redirect is landing (`/`).
 */
export async function performLogout(redirectTo: string = ROUTES.HOME): Promise<void> {
  getQueryClient().cancelQueries();

  await fetch(`${BFF_API_BASE}/auth/logout`, {
    method: "POST",
    credentials: "include",
  }).catch(() => {});

  clearSessionLocally();

  if (typeof window !== "undefined") {
    window.location.href = redirectTo;
  }
}

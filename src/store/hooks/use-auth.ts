"use client";

import { clearSessionLocally } from "@/lib/auth/session";
import { useAuthSlice, useIsAuthenticated, useUserRole } from "@/store/slices/auth.slice";
import { canAccess } from "@/config/roles";

export { useIsAuthenticated, useUserRole };

export function useAuthActions() {
  const setAuth = useAuthSlice((s) => s.setAuth);
  const setToken = useAuthSlice((s) => s.setToken);
  const setWallet = useAuthSlice((s) => s.setWallet);
  const updateSession = useAuthSlice((s) => s.updateSession);
  return { setAuth, setToken, setWallet, updateSession, clearAuth: clearSessionLocally };
}

export function useCanAccess(path: string) {
  const role = useUserRole();
  return role ? canAccess(path, role) : false;
}

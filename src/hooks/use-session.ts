"use client";

import { clearSessionLocally } from "@/lib/auth/session";
import { useAuthSlice } from "@/store/slices/auth.slice";

export function useSession() {
  const token = useAuthSlice((s) => s.token);
  const role = useAuthSlice((s) => s.role);
  const userId = useAuthSlice((s) => s.userId);
  const fullName = useAuthSlice((s) => s.fullName);
  const mobile = useAuthSlice((s) => s.mobile);
  const email = useAuthSlice((s) => s.email);
  const inviteCode = useAuthSlice((s) => s.inviteCode);
  const balance = useAuthSlice((s) => s.balance);
  const wallet = useAuthSlice((s) => s.wallet);
  const recentSessions = useAuthSlice((s) => s.recentSessions);

  return {
    token,
    role,
    userId,
    fullName,
    mobile,
    email,
    inviteCode,
    balance,
    wallet,
    recentSessions,
    isAuthenticated: !!token,
    logout: clearSessionLocally,
  };
}

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthSlice } from "@/store/types/store.types";

export const useAuthSlice = create<AuthSlice>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      role: null,
      userId: null,
      fullName: null,
      mobile: null,
      email: null,
      inviteCode: null,
      balance: null,
      wallet: null,
      recentSessions: [],

      setAuth: (payload) =>
        set({
          token: payload.token,
          refreshToken: payload.refreshToken,
          role: payload.role,
          userId: payload.userId,
          fullName: payload.fullName,
          mobile: payload.mobile ?? null,
          email: payload.email ?? null,
          inviteCode: payload.inviteCode ?? null,
          balance: payload.balance ?? payload.wallet?.totalTokens ?? null,
          wallet: payload.wallet ?? null,
          recentSessions: payload.recentSessions ?? [],
        }),

      setToken: (token, refreshToken) => set({ token, refreshToken }),

      setWallet: (wallet) =>
        set({
          wallet,
          balance: wallet?.totalTokens ?? null,
        }),

      updateSession: (payload) =>
        set((state) => ({
          ...state,
          ...payload,
          balance: payload.balance ?? payload.wallet?.totalTokens ?? state.balance,
        })),

      clearAuth: () =>
        set({
          token: null,
          refreshToken: null,
          role: null,
          userId: null,
          fullName: null,
          mobile: null,
          email: null,
          inviteCode: null,
          balance: null,
          wallet: null,
          recentSessions: [],
        }),
    }),
    {
      name: "nib-auth",
      partialize: (s) => ({
        token: s.token,
        refreshToken: s.refreshToken,
        role: s.role,
        userId: s.userId,
        fullName: s.fullName,
        mobile: s.mobile,
        email: s.email,
        inviteCode: s.inviteCode,
        balance: s.balance,
        wallet: s.wallet,
      }),
    },
  ),
);

export const useIsAuthenticated = () => useAuthSlice((s) => !!s.token);
export const useUserRole = () => useAuthSlice((s) => s.role);
export const useUserId = () => useAuthSlice((s) => s.userId);
export const useFullName = () => useAuthSlice((s) => s.fullName);
export const useAuthToken = () => useAuthSlice((s) => s.token);

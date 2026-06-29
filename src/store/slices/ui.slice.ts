"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UiSlice, Theme } from "@/store/types/store.types";

export const useUiSlice = create<UiSlice>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      activeModal: null,
      theme: "system" as Theme,

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      openModal: (id) => set({ activeModal: id }),
      closeModal: () => set({ activeModal: null }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "nib-ui",
      partialize: (s) => ({ theme: s.theme }),
    },
  ),
);

// Selector hooks
export const useSidebarOpen = () => useUiSlice((s) => s.sidebarOpen);
export const useActiveModal = () => useUiSlice((s) => s.activeModal);
export const useTheme = () => useUiSlice((s) => s.theme);
export const useSetTheme = () => useUiSlice((s) => s.setTheme);

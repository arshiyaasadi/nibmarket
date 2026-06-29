"use client";

import { useUiSlice, useSidebarOpen, useActiveModal } from "@/store/slices/ui.slice";

export { useSidebarOpen, useActiveModal };

export function useUiActions() {
  const toggleSidebar = useUiSlice((s) => s.toggleSidebar);
  const setSidebarOpen = useUiSlice((s) => s.setSidebarOpen);
  const openModal = useUiSlice((s) => s.openModal);
  const closeModal = useUiSlice((s) => s.closeModal);
  return { toggleSidebar, setSidebarOpen, openModal, closeModal };
}

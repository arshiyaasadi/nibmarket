"use client";

import { useEffect } from "react";
import { useAuthSlice } from "@/store/slices/auth.slice";
import { useDashboardWallet } from "@/features/dashboard/queries";

/** Keeps auth store wallet in sync with the latest dashboard wallet query. */
export function useSyncWalletStore() {
  const setWallet = useAuthSlice((s) => s.setWallet);
  const { data } = useDashboardWallet();

  useEffect(() => {
    if (data) setWallet(data);
  }, [data, setWallet]);
}

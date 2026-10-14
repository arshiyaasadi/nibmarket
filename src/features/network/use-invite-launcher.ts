"use client";

import { useCallback, useState } from "react";
import { useInviteQuota } from "@/features/network/queries";

/**
 * Opens the VIP invite flow, or the KYC gate modal when backend says canInvite=false.
 */
export function useInviteLauncher() {
  const { data: quota } = useInviteQuota();
  const [showGate, setShowGate] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  const openInvite = useCallback(() => {
    if (quota?.canInvite === false) {
      setShowGate(true);
      return;
    }
    setShowInvite(true);
  }, [quota?.canInvite]);

  const closeGate = useCallback(() => setShowGate(false), []);
  const closeInvite = useCallback(() => setShowInvite(false), []);

  return {
    openInvite,
    showGate,
    closeGate,
    showInvite,
    closeInvite,
  };
}

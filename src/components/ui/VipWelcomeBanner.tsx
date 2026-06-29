"use client";

import { useSyncExternalStore, useState } from "react";
import { Crown, X } from "lucide-react";
import { useNetworkReferrer } from "@/features/network/queries";

const STORAGE_KEY = "vip_welcome_shown";

const subscribeNoop = () => () => {};
const readVipWelcomeShown = () => localStorage.getItem(STORAGE_KEY) !== null;
const getServerVipWelcomeShown = () => true;

export function VipWelcomeBanner() {
  const { data: referrer } = useNetworkReferrer();
  const alreadyShown = useSyncExternalStore(
    subscribeNoop,
    readVipWelcomeShown,
    getServerVipWelcomeShown,
  );
  const [dismissed, setDismissed] = useState(false);

  const show =
    referrer?.inviteType === "vip" && !alreadyShown && !dismissed;

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
  }

  if (!show) return null;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-yellow-400/30 bg-yellow-400/5 px-4 py-3" dir="rtl">
      <Crown size={16} className="shrink-0 text-yellow-500" />
      <p className="flex-1 text-sm text-foreground">
        شما از طریق <span className="font-semibold text-yellow-600">دعوت VIP</span> عضو NIB Club شدید — پاداش ثبت‌نام شما به زودی اعمال می‌شود.
      </p>
      <button onClick={dismiss} className="shrink-0 text-muted hover:text-foreground">
        <X size={14} />
      </button>
    </div>
  );
}

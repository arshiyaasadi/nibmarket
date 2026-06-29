/**
 * @level molecule
 * @spacing internal: gap-atom-md (items), px-pad-atom-md py-pad-atom (wrapper) | external: none
 */
"use client";

import { useRef, useState } from "react";
import { Coins } from "lucide-react";
import { useTranslations } from "next-intl";
import { useDashboardWallet } from "@/features/dashboard/queries";
import { PROJECT } from "@/config/project";
import Link from "next/link";

export function WalletBalanceChip() {
  const t = useTranslations("auth");
  const { data: wallet } = useDashboardWallet();
  const [show, setShow] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const available = wallet?.availableTokens ?? 0;
  const frozen = wallet?.frozenTokens ?? 0;
  const total = wallet?.totalTokens ?? 0;

  function fmt(n: number) {
    return n.toLocaleString("fa-IR");
  }

  function onEnter() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShow(true);
  }
  function onLeave() {
    timerRef.current = setTimeout(() => setShow(false), 150);
  }

  return (
    <div className="relative" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <Link
        href="/dashboard/wallet"
        className="flex items-center gap-atom-md rounded-lg border-2 border-primary px-pad-atom-md py-pad-atom transition-colors hover:bg-primary/5"
      >
        <Coins aria-hidden="true" className="size-4 shrink-0 text-primary" />
        <span className="font-semibold tabular-nums text-primary text-sm">{fmt(available)}</span>
        <span className="text-xs text-primary-700">{PROJECT.token.name}</span>
      </Link>

      {/* Hover popup */}
      <div
        className={[
          "absolute end-0 top-full z-50 mt-atom-md w-64 rounded-xl border border-border bg-surface shadow-lg p-atom-md p-pad-mol",
          "transition-all duration-200",
          show ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1 pointer-events-none",
        ].join(" ")}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        <div className="flex flex-col gap-atom-md divide-y divide-border overflow-hidden rounded-xl">
          <WalletRow label={t("walletBalance")} value={fmt(total)} unit={PROJECT.token.name} />
          <WalletRow label={t("walletAvailable")} value={fmt(available)} unit={PROJECT.token.name} highlight />
          <WalletRow label={t("walletFrozen")} value={fmt(frozen)} unit={PROJECT.token.name} muted />
          <Link href="/dashboard/wallet" className="text-center px-pad-atom-md py-atom-md text-xs text-primary hover:text-primary-700">تراکنش ها</Link>
        </div>
      </div>
    </div>
  );
}

function WalletRow({
  label, value, unit, highlight, muted,
}: {
  label: string; value: string; unit: string; highlight?: boolean; muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-pad-atom-md py-atom-md">
      <span className="text-xs text-muted">{label}</span>
      <span className={[
        "text-sm font-semibold tabular-nums",
        highlight ? "text-primary" : muted ? "text-warning" : "text-foreground",
      ].join(" ")}>
        {value} <span className="text-xs font-normal text-muted">{unit}</span>
      </span>
    </div>
  );
}

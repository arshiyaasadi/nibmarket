/**
 * @level molecule
 * @spacing internal: gap-atom-md (items), px-pad-atom-md py-pad-atom (wrapper) | external: none
 */
"use client";

import { useRef, useState } from "react";
import { Coins } from "lucide-react";
import { useTranslations } from "next-intl";
import { useDashboardWallet } from "@/features/dashboard/queries";
import { useSession } from "@/hooks/use-session";
import { PROJECT } from "@/config/project";
import Link from "next/link";

export function WalletBalanceChip() {
  const t = useTranslations("auth");
  const { wallet: sessionWallet } = useSession();
  const { data: walletData } = useDashboardWallet();
  const wallet = walletData ?? sessionWallet;
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
        className="gap-atom-md border-primary px-pad-atom-md py-pad-atom hover:bg-primary/5 flex items-center rounded-lg border-2 transition-colors"
      >
        <Coins aria-hidden="true" className="text-primary size-4 shrink-0" />
        <span className="text-primary text-sm font-semibold tabular-nums">{fmt(available)}</span>
        <span className="text-primary-700 text-xs">{PROJECT.token.name}</span>
      </Link>

      {/* Hover popup */}
      <div
        className={[
          "mt-atom-md border-border bg-surface p-atom-md p-pad-mol absolute end-0 top-full z-50 w-64 rounded-xl border shadow-lg",
          "transition-all duration-200",
          show
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0",
        ].join(" ")}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        <div className="gap-atom-md divide-border flex flex-col divide-y overflow-hidden rounded-xl">
          <WalletRow label={t("walletBalance")} value={fmt(total)} unit={PROJECT.token.name} />
          <WalletRow
            label={t("walletAvailable")}
            value={fmt(available)}
            unit={PROJECT.token.name}
            highlight
          />
          <WalletRow
            label={t("walletFrozen")}
            value={fmt(frozen)}
            unit={PROJECT.token.name}
            muted
          />
          <Link
            href="/dashboard/wallet"
            className="px-pad-atom-md py-atom-md text-primary hover:text-primary-700 text-center text-xs"
          >
            تراکنش ها
          </Link>
        </div>
      </div>
    </div>
  );
}

function WalletRow({
  label,
  value,
  unit,
  highlight,
  muted,
}: {
  label: string;
  value: string;
  unit: string;
  highlight?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="px-pad-atom-md py-atom-md flex items-center justify-between">
      <span className="text-muted text-xs">{label}</span>
      <span
        className={[
          "text-sm font-semibold tabular-nums",
          highlight ? "text-primary" : muted ? "text-warning" : "text-foreground",
        ].join(" ")}
      >
        {value} <span className="text-muted text-xs font-normal">{unit}</span>
      </span>
    </div>
  );
}

/**
 * @level molecule
 * @spacing internal: gap-atom-md (items), px-pad-atom-md py-pad-atom (wrapper) | external: none
 */
"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, Coins } from "lucide-react";
import { useTranslations } from "next-intl";
import { useDashboardWallet } from "@/features/dashboard/queries";
import { useSession } from "@/hooks/use-session";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { BottomSheetPanel } from "@/components/atoms/BottomSheetPanel";
import { PROJECT } from "@/config/project";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function WalletBalanceChip() {
  const t = useTranslations("auth");
  const isMobile = useIsMobile();
  const { wallet: sessionWallet } = useSession();
  const { data: walletData } = useDashboardWallet();
  const wallet = walletData ?? sessionWallet;
  const [show, setShow] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const available = wallet?.availableTokens ?? 0;
  const frozen = wallet?.frozenTokens ?? 0;
  const total = wallet?.totalTokens ?? 0;

  function fmt(n: number) {
    return n.toLocaleString("fa-IR");
  }

  function onEnter() {
    if (isMobile) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setShow(true);
  }

  function onLeave() {
    if (isMobile) return;
    timerRef.current = setTimeout(() => setShow(false), 150);
  }

  function handleChipClick(e: React.MouseEvent) {
    if (!isMobile) return;
    e.preventDefault();
    setSheetOpen(true);
  }

  const chipClassName =
    "gap-atom-md border-primary px-pad-atom-md py-pad-atom hover:bg-primary/5 flex items-center rounded-xl border-2 transition-colors";

  const chipContent = (
    <>
      <Coins aria-hidden="true" className="text-primary size-4 shrink-0" />
      <span className="text-primary text-sm font-semibold tabular-nums">{fmt(available)}</span>
      <span className="text-primary-700 text-xs">{PROJECT.token.name}</span>
    </>
  );

  const walletPanel = (
    <div className="flex flex-col gap-4">
      <div className="bg-primary/5 border-primary/15 flex items-center gap-3 rounded-2xl border p-4">
        <div className="bg-primary/10 flex size-11 shrink-0 items-center justify-center rounded-xl">
          <Coins className="text-primary size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-muted text-xs">{t("walletAvailable")}</p>
          <p className="text-primary text-xl font-bold tabular-nums">
            {fmt(available)}{" "}
            <span className="text-primary-700 text-sm font-medium">{PROJECT.token.name}</span>
          </p>
        </div>
      </div>

      <div className="divide-border border-border flex flex-col divide-y overflow-hidden rounded-2xl border">
        <WalletRow label={t("walletTotal")} value={fmt(total)} unit={PROJECT.token.name} />
        <WalletRow
          label={t("walletAvailable")}
          value={fmt(available)}
          unit={PROJECT.token.name}
          highlight
        />
        <WalletRow label={t("walletFrozen")} value={fmt(frozen)} unit={PROJECT.token.name} muted />
      </div>

      <Link
        href="/dashboard/wallet"
        onClick={() => setSheetOpen(false)}
        className="bg-primary hover:bg-primary-600 flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition-colors"
      >
        {t("walletTransactions")}
        <ChevronLeft className="size-4 rotate-180" />
      </Link>
    </div>
  );

  return (
    <>
      <div className="relative" onMouseEnter={onEnter} onMouseLeave={onLeave}>
        {isMobile ? (
          <button type="button" onClick={handleChipClick} className={chipClassName}>
            {chipContent}
          </button>
        ) : (
          <Link href="/dashboard/wallet" className={chipClassName}>
            {chipContent}
          </Link>
        )}

        {!isMobile && (
          <div
            className={cn(
              "border-border bg-surface absolute end-0 top-[calc(100%+0.5rem)] z-50 w-72 overflow-hidden rounded-2xl border shadow-xl",
              "transition-all duration-200",
              show
                ? "pointer-events-auto translate-y-0 opacity-100"
                : "pointer-events-none -translate-y-1 opacity-0",
            )}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
          >
            <div className="border-border bg-primary/5 border-b px-4 py-3">
              <p className="text-muted text-xs">{t("walletBalance")}</p>
              <p className="text-primary text-lg font-bold tabular-nums">
                {fmt(total)} {PROJECT.token.name}
              </p>
            </div>
            <div className="divide-border flex flex-col divide-y">
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
            </div>
            <Link
              href="/dashboard/wallet"
              className="text-primary hover:bg-surface-2 flex h-11 items-center justify-center gap-1.5 text-xs font-medium transition-colors"
            >
              {t("walletTransactions")}
              <ArrowLeft className="size-3.5" />
            </Link>
          </div>
        )}
      </div>

      {isMobile && (
        <BottomSheetPanel
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          title={t("walletBalance")}
        >
          {walletPanel}
        </BottomSheetPanel>
      )}
    </>
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
    <div className="flex items-center justify-between px-4 py-3.5">
      <span className="text-muted text-xs">{label}</span>
      <span
        className={cn(
          "text-sm font-semibold tabular-nums",
          highlight ? "text-primary" : muted ? "text-warning" : "text-foreground",
        )}
      >
        {value} <span className="text-muted text-xs font-normal">{unit}</span>
      </span>
    </div>
  );
}

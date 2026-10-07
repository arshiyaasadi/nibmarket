"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ShoppingCart,
  TrendingDown,
  Download,
  Send,
  X,
  Zap,
  Copy,
  Check,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
} from "lucide-react";
import { cn, formatDisplayDate, truncateIdentifier } from "@/lib/utils";
import { useWalletSummary, useWalletTransactions, useTokenPrice } from "@/features/wallet/queries";
import { TokenPriceChart } from "@/components/molecules/TokenPriceChart";
import type { WalletTxType } from "@/types/mlm";
import { normalizeDecimalInput, normalizeSearchInput } from "@/lib/normalization/digits";

// ── Mock wallet address ────────────────────────────────────────
const MOCK_WALLET_ADDRESS = "TWIN1qzpx4h9m3wks8ry62ndvtc5eajf0ul7gx";

// ── Types ──────────────────────────────────────────────────────
type ModalType = "buy" | "sell" | "receive" | "transfer" | null;

type TxFilter = WalletTxType | "all";
const TX_FILTERS: { key: TxFilter; labelKey: string }[] = [
  { key: "all", labelKey: "txFilterAll" },
  { key: "mission_reward", labelKey: "txFilterMission" },
  { key: "commission_reward", labelKey: "txFilterReferral" },
  { key: "mint", labelKey: "txFilterDeposit" },
  { key: "adjustment", labelKey: "txFilterBuy" },
  { key: "transfer_in", labelKey: "txFilterTransferIn" },
  { key: "transfer_out", labelKey: "txFilterTransferOut" },
];

// ── Main component ─────────────────────────────────────────────
export function WalletContent() {
  const t = useTranslations("wallet");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [modal, setModal] = useState<ModalType>(null);

  // URL-driven filters
  const typeFilter = (searchParams.get("type") as TxFilter) || "all";
  const rrnSearch = searchParams.get("rrn") || "";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") params.set(key, value);
      else params.delete(key);
      router.replace(`/dashboard/wallet${params.size ? `?${params}` : ""}`, { scroll: false });
    },
    [searchParams, router],
  );

  const { data: summary, isLoading: loadingSummary } = useWalletSummary();
  const { data: priceData, isLoading: loadingPrice } = useTokenPrice();

  const {
    data: txPages,
    isLoading: loadingTx,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useWalletTransactions(typeFilter, rrnSearch);

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (e) => {
        if (e[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: "120px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const txItems = txPages?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="flex flex-col gap-6">
      {/* ── Row 1: Summary + Chart ── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        {/* Summary card */}
        <div className="border-border bg-surface flex-1 rounded-2xl border p-5">
          {/* Balance */}
          <div className="mb-5 flex flex-col gap-1">
            <span className="text-muted text-xs">{t("totalBalance")}</span>
            {loadingSummary ? (
              <div className="bg-surface-2 h-8 w-32 animate-pulse rounded-lg" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-foreground text-3xl font-bold tabular-nums">
                  {summary?.totalTokens.toLocaleString("fa-IR")}
                </span>
                <span className="text-muted text-sm">{t("tokenUnit")}</span>
              </div>
            )}
            <div className="mt-2 flex gap-4 text-xs">
              <span className="text-muted">
                {t("availableBalance")}:{" "}
                <span className="text-primary font-semibold">
                  {summary?.availableTokens.toLocaleString("fa-IR")}
                </span>
              </span>
              <span className="text-muted">
                {t("frozenBalance")}:{" "}
                <span className="text-warning font-semibold">
                  {summary?.frozenTokens.toLocaleString("fa-IR")}
                </span>
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-4 gap-2">
            {(
              [
                { key: "buy", icon: ShoppingCart, labelKey: "actionBuy" },
                { key: "sell", icon: TrendingDown, labelKey: "actionSell" },
                { key: "receive", icon: Download, labelKey: "actionReceive" },
                { key: "transfer", icon: Send, labelKey: "actionTransfer" },
              ] as const
            ).map(({ key, icon: Icon, labelKey }) => (
              <button
                key={key}
                type="button"
                onClick={() => setModal(key)}
                className="border-border bg-surface-2 hover:bg-primary/5 hover:border-primary/30 flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center transition-colors"
              >
                <div className="bg-primary/10 flex size-9 items-center justify-center rounded-lg">
                  <Icon className="text-primary size-4" />
                </div>
                <span className="text-foreground text-xs font-medium">{t(labelKey)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Price chart */}
        <div className="border-border bg-surface flex h-full flex-col rounded-2xl border p-5 lg:w-80">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-foreground text-sm font-semibold">{t("priceChartTitle")}</span>
            <span className="text-muted text-xs">{t("priceChartTimeframe")}</span>
          </div>
          <TokenPriceChart points={priceData ?? []} isLoading={loadingPrice} />
        </div>
      </div>

      {/* ── Row 2: Transaction table ── */}
      <div className="flex flex-col gap-4">
        <h2 className="text-foreground text-base font-bold">{t("txTitle")}</h2>

        {/* Filters + search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="border-border bg-surface flex flex-wrap items-center gap-1 rounded-xl border p-1">
            {TX_FILTERS.map(({ key, labelKey }) => (
              <button
                key={key}
                type="button"
                onClick={() => updateParam("type", key)}
                className={cn(
                  "rounded-lg px-3 py-1 text-xs font-medium transition-colors",
                  typeFilter === key
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted hover:text-foreground",
                )}
              >
                {t(labelKey)}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={rrnSearch}
            onChange={(e) => updateParam("rrn", normalizeSearchInput(e.target.value))}
            placeholder={t("txSearchPlaceholder")}
            className="border-border bg-surface text-foreground placeholder:text-muted focus:border-primary w-full rounded-xl border px-3 py-2 text-sm focus:outline-none sm:w-60"
            dir="rtl"
          />
        </div>

        {/* Transaction list */}
        <div className="border-border bg-surface overflow-hidden rounded-2xl border">
          {/* Desktop header */}
          <div className="border-border bg-surface-2 hidden items-center gap-2 border-b px-4 py-3 sm:flex">
            <span className="text-muted w-[4.5rem] shrink-0 text-xs font-semibold">
              {t("colId")}
            </span>
            <span className="text-muted w-20 shrink-0 text-xs font-semibold">{t("colType")}</span>
            <span className="text-muted flex-1 text-xs font-semibold">{t("colDesc")}</span>
            <span className="text-muted w-28 shrink-0 text-xs font-semibold">{t("colDate")}</span>
            <span className="text-muted w-32 shrink-0 text-xs font-semibold">{t("colRrn")}</span>
            <span className="text-muted w-24 shrink-0 text-end text-xs font-semibold">
              {t("colAmount")}
            </span>
          </div>

          <div className="divide-border divide-y">
            {loadingTx ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2 px-4 py-3">
                  <div className="bg-surface-2 h-4 w-3/4 animate-pulse rounded" />
                  <div className="bg-surface-2 h-3 w-1/2 animate-pulse rounded" />
                </div>
              ))
            ) : txItems.length === 0 ? (
              <div className="text-muted py-12 text-center text-sm">{t("noTx")}</div>
            ) : (
              txItems.map((tx) => (
                <div key={tx.id} className="hover:bg-surface-2 px-4 py-3 transition-colors">
                  {/* Mobile */}
                  <div className="sm:hidden">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <TxTypeBadge type={tx.type} t={t} />
                        <span className="text-foreground truncate text-sm font-medium">
                          {tx.description}
                        </span>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 text-sm font-bold whitespace-nowrap tabular-nums",
                          tx.amount > 0 ? "text-success" : "text-error",
                        )}
                      >
                        {tx.amount > 0 ? "+" : ""}
                        {tx.amount.toLocaleString("fa-IR")}
                      </span>
                    </div>
                    <div className="text-muted mt-1.5 flex flex-wrap items-center gap-3 text-xs">
                      <CopyableId value={tx.id} withHash t={t} />
                      <span>{formatDisplayDate(tx.date)}</span>
                      {tx.rrn && <CopyableId value={tx.rrn} t={t} />}
                    </div>
                  </div>
                  {/* Desktop */}
                  <div className="hidden sm:flex sm:items-center sm:gap-2">
                    <CopyableId value={tx.id} withHash t={t} className="w-[4.5rem]" />
                    <div className="w-20 shrink-0">
                      <TxTypeBadge type={tx.type} t={t} />
                    </div>
                    <span className="text-foreground flex-1 truncate text-sm">
                      {tx.description}
                    </span>
                    <span className="text-muted w-28 shrink-0 text-sm">
                      {formatDisplayDate(tx.date)}
                    </span>
                    {tx.rrn ? (
                      <CopyableId value={tx.rrn} t={t} className="w-32" />
                    ) : (
                      <span className="text-muted w-32 shrink-0 text-xs">—</span>
                    )}
                    <span
                      className={cn(
                        "w-24 shrink-0 text-end text-sm font-bold tabular-nums",
                        tx.amount > 0 ? "text-success" : "text-error",
                      )}
                    >
                      {tx.amount > 0 ? "+" : ""}
                      {tx.amount.toLocaleString("fa-IR")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div ref={sentinelRef} className="h-1" />
          {isFetchingNextPage && (
            <div className="text-muted py-3 text-center text-xs">{t("loadingMore")}</div>
          )}
          {!hasNextPage && txItems.length > 0 && (
            <div className="text-muted py-3 text-center text-xs">{t("noMore")}</div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {modal === "buy" && <BuyModal onClose={() => setModal(null)} summary={summary} t={t} />}
      {modal === "sell" && <SellModal onClose={() => setModal(null)} summary={summary} t={t} />}
      {modal === "receive" && <ReceiveModal onClose={() => setModal(null)} t={t} />}
      {modal === "transfer" && (
        <TransferModal onClose={() => setModal(null)} summary={summary} t={t} />
      )}
    </div>
  );
}

// ── CopyableId ─────────────────────────────────────────────────
function CopyableId({
  value,
  withHash = false,
  t,
  className,
}: {
  value: string;
  withHash?: boolean;
  t: (k: string) => string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const raw = value.replace(/^#/, "");
  const display = `${withHash ? "#" : ""}${truncateIdentifier(raw)}`;
  const fullDisplay = `${withHash ? "#" : ""}${raw}`;

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(raw).catch(() => {});
    setCopied(true);
    setShowTip(false);
    setTimeout(() => setCopied(false), 1600);
  }, [raw]);

  const clearHoldTimer = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <button
        type="button"
        onClick={copy}
        onMouseEnter={() => setShowTip(true)}
        onMouseLeave={() => {
          clearHoldTimer();
          if (!copied) setShowTip(false);
        }}
        onFocus={() => setShowTip(true)}
        onBlur={() => {
          if (!copied) setShowTip(false);
        }}
        onTouchStart={() => {
          clearHoldTimer();
          holdTimerRef.current = setTimeout(() => setShowTip(true), 450);
        }}
        onTouchEnd={clearHoldTimer}
        onTouchCancel={clearHoldTimer}
        className={cn(
          "max-w-full truncate font-mono text-xs transition-colors",
          copied ? "text-success" : "text-muted hover:text-foreground",
        )}
        dir="ltr"
        aria-label={t("idCopyHint")}
      >
        {copied ? t("idCopied") : display}
      </button>

      {showTip && !copied && (
        <span
          role="tooltip"
          className="border-border bg-foreground text-background pointer-events-none absolute start-0 bottom-[calc(100%+6px)] z-30 max-w-[min(16rem,calc(100vw-2rem))] rounded-lg border px-2.5 py-1.5 text-[11px] leading-snug font-normal shadow-lg"
          dir="ltr"
        >
          <span className="block font-mono break-all">{fullDisplay}</span>
          <span className="mt-0.5 block text-[10px] opacity-75">{t("idCopyHint")}</span>
        </span>
      )}
    </span>
  );
}

// ── TxTypeBadge ────────────────────────────────────────────────
function TxTypeBadge({ type, t }: { type: WalletTxType; t: (k: string) => string }) {
  const map: Record<WalletTxType, { label: string; cls: string; icon: typeof ArrowDownLeft }> = {
    mission_reward: { label: t("typeMission"), cls: "bg-primary/10 text-primary", icon: Zap },
    commission_reward: {
      label: t("typeReferral"),
      cls: "bg-purple-500/10 text-purple-500",
      icon: ArrowDownLeft,
    },
    mint: { label: t("typeDeposit"), cls: "bg-success/10 text-success", icon: ArrowDownLeft },
    adjustment: { label: t("typeBuy"), cls: "bg-blue-500/10 text-blue-500", icon: ShoppingCart },
    lock: { label: t("typeSell"), cls: "bg-warning/10 text-warning", icon: TrendingDown },
    unlock: { label: t("typeDeposit"), cls: "bg-success/10 text-success", icon: ArrowDownLeft },
    pool_deposit: {
      label: t("typeDeposit"),
      cls: "bg-success/10 text-success",
      icon: ArrowDownLeft,
    },
    pool_withdrawal: {
      label: t("typeSell"),
      cls: "bg-warning/10 text-warning",
      icon: TrendingDown,
    },
    transfer_in: {
      label: t("typeTransferIn"),
      cls: "bg-success/10 text-success",
      icon: ArrowDownLeft,
    },
    transfer_out: {
      label: t("typeTransferOut"),
      cls: "bg-error/10 text-error",
      icon: ArrowUpRight,
    },
  };
  const { label, cls, icon: Icon } = map[type] ?? map.adjustment;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        cls,
      )}
    >
      <Icon className="size-3" />
      {label}
    </span>
  );
}

// ── Modal wrapper ──────────────────────────────────────────────
function WalletModal({
  onClose,
  title,
  children,
}: {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="border-border bg-surface relative z-10 w-full max-w-md rounded-3xl border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <div className="border-border flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-foreground text-base font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:bg-surface-2 flex size-8 items-center justify-center rounded-lg"
            aria-label="بستن"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ── Buy Modal ──────────────────────────────────────────────────
function BuyModal({
  onClose,
  summary,
  t,
}: {
  onClose: () => void;
  summary?: { availableTokens: number };
  t: (k: string) => string;
}) {
  return (
    <WalletModal onClose={onClose} title={t("buyTitle")}>
      <p className="text-muted mb-4 text-sm leading-relaxed">{t("buyDesc")}</p>

      {/* Mission card */}
      <div className="border-primary/20 bg-primary/5 mb-4 flex items-start gap-3 rounded-2xl border p-4">
        <div className="bg-primary/10 flex size-8 shrink-0 items-center justify-center rounded-xl">
          <Zap className="text-primary size-4" />
        </div>
        <div>
          <span className="text-primary block text-xs font-semibold">{t("buyMissionLabel")}</span>
          <span className="text-foreground text-sm">{t("buyMissionDesc")}</span>
        </div>
      </div>

      {summary && (
        <p className="text-muted mb-4 text-xs">
          {t("transferAvailable")}:{" "}
          <span className="text-foreground font-semibold">
            {summary.availableTokens.toLocaleString("fa-IR")} تنوین
          </span>
        </p>
      )}

      <a
        href="#"
        className="bg-primary hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-colors"
      >
        <ExternalLink className="size-4" />
        {t("buyCtaApp")}
      </a>
    </WalletModal>
  );
}

// ── Sell Modal ─────────────────────────────────────────────────
function SellModal({
  onClose,
  summary,
  t,
}: {
  onClose: () => void;
  summary?: { availableTokens: number };
  t: (k: string) => string;
}) {
  return (
    <WalletModal onClose={onClose} title={t("sellTitle")}>
      <p className="text-muted mb-4 text-sm leading-relaxed">{t("sellDesc")}</p>

      <div className="border-warning/20 bg-warning/5 mb-4 flex items-start gap-3 rounded-2xl border p-4">
        <div className="bg-warning/10 flex size-8 shrink-0 items-center justify-center rounded-xl">
          <Zap className="text-warning size-4" />
        </div>
        <div>
          <span className="text-warning block text-xs font-semibold">{t("buyMissionLabel")}</span>
          <span className="text-foreground text-sm">{t("sellMissionDesc")}</span>
        </div>
      </div>

      {summary && (
        <p className="text-muted mb-4 text-xs">
          {t("transferAvailable")}:{" "}
          <span className="text-foreground font-semibold">
            {summary.availableTokens.toLocaleString("fa-IR")} تنوین
          </span>
        </p>
      )}

      <a
        href="#"
        className="bg-warning hover:bg-warning/90 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-colors"
      >
        <ExternalLink className="size-4" />
        {t("sellCtaApp")}
      </a>
    </WalletModal>
  );
}

// ── Receive Modal ──────────────────────────────────────────────
function ReceiveModal({ onClose, t }: { onClose: () => void; t: (k: string) => string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(MOCK_WALLET_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <WalletModal onClose={onClose} title={t("receiveTitle")}>
      {/* QR Code — pure SVG mock */}
      <div className="mx-auto mb-4 w-40">
        <MockQR />
      </div>

      <p className="text-muted mb-2 text-xs font-medium">{t("receiveAddress")}</p>
      <div className="border-border bg-surface-2 mb-4 flex items-center gap-2 rounded-xl border p-3">
        <span className="text-foreground flex-1 font-mono text-xs break-all" dir="ltr">
          {MOCK_WALLET_ADDRESS}
        </span>
      </div>

      <p className="text-muted mb-4 text-xs">{t("receiveHint")}</p>

      <button
        type="button"
        onClick={copy}
        className="bg-primary hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-colors"
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        {copied ? t("receiveCopied") : t("receiveCopy")}
      </button>
    </WalletModal>
  );
}

// ── Transfer Modal ─────────────────────────────────────────────
function TransferModal({
  onClose,
  summary,
  t,
}: {
  onClose: () => void;
  summary?: { availableTokens: number };
  t: (k: string) => string;
}) {
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");

  return (
    <WalletModal onClose={onClose} title={t("transferTitle")}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-muted text-xs font-medium">{t("transferAddress")}</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={t("transferAddressPlaceholder")}
            className="border-border bg-surface-2 text-foreground placeholder:text-muted focus:border-primary w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none"
            dir="ltr"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-muted text-xs font-medium">{t("transferAmount")}</label>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(normalizeDecimalInput(e.target.value))}
            placeholder={t("transferAmountPlaceholder")}
            className="border-border bg-surface-2 text-foreground placeholder:text-muted focus:border-primary w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none"
            dir="rtl"
          />
          {summary && (
            <p className="text-muted text-xs">
              {t("transferAvailable")}:{" "}
              <span className="text-primary font-semibold">
                {summary.availableTokens.toLocaleString("fa-IR")} تنوین
              </span>
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="bg-primary hover:bg-primary/90 mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-colors"
      >
        <Send className="size-4" />
        {t("transferConfirm")}
      </button>
    </WalletModal>
  );
}

// ── Mock QR SVG ────────────────────────────────────────────────
function MockQR() {
  const cells = 15;
  const size = 160;
  const cellSize = size / cells;

  // Deterministic pattern based on wallet address chars
  const grid = Array.from({ length: cells }, (_, r) =>
    Array.from({ length: cells }, (_, c) => {
      // Finder patterns (corners)
      if ((r < 3 && c < 3) || (r < 3 && c >= cells - 3) || (r >= cells - 3 && c < 3)) return true;
      const charCode = MOCK_WALLET_ADDRESS.charCodeAt((r * cells + c) % MOCK_WALLET_ADDRESS.length);
      return (charCode + r * 7 + c * 13) % 3 !== 0;
    }),
  );

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="border-border w-full rounded-xl border bg-white p-2"
    >
      {grid.map((row, r) =>
        row.map((filled, c) =>
          filled ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#1a1a1a"
            />
          ) : null,
        ),
      )}
    </svg>
  );
}

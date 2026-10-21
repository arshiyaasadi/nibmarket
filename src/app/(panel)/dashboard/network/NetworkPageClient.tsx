"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useTranslations } from "next-intl";
import { Users, Zap, Check, Copy, Link2 } from "lucide-react";
import { useNetworkInvited } from "@/features/network/queries";
import { useDashboardReferral } from "@/features/dashboard/queries";
import { useMarketingBadges } from "@/features/missions/queries";
import { useSession } from "@/hooks/use-session";
import { InviteModal } from "@/components/organisms/network/InviteModal";
import { VipInviteButton } from "@/components/molecules/VipInviteButton";
import { NetworkTreeWidget } from "@/components/organisms/network/NetworkTreeWidget";
import { MarketingBadgesSection } from "@/components/molecules/MarketingBadgesSection";
import { ROUTES } from "@/config/routes";
import type { InviteStatus } from "@/types/mlm";
import { cn, formatDisplayDate } from "@/lib/utils";
import { normalizeSearchInput } from "@/lib/normalization/digits";
import { buildPublicInviteUrl } from "@/lib/invite/pending-invite";

function InviteCard({ onVipInvite }: { onVipInvite: () => void }) {
  const t = useTranslations("network");
  const { inviteCode: sessionInviteCode } = useSession();
  const { data: referralData } = useDashboardReferral();
  const inviteCode = referralData?.inviteCode ?? sessionInviteCode;
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(inviteCode ?? "").catch(() => {});
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }, [inviteCode]);

  const copyLink = useCallback(() => {
    if (!inviteCode) return;
    navigator.clipboard.writeText(buildPublicInviteUrl(inviteCode)).catch(() => {});
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }, [inviteCode]);

  return (
    <div className="flex min-h-0 w-full flex-col gap-3 lg:w-[38%] lg:shrink-0">
      <h2 className="text-foreground shrink-0 text-base font-bold">{t("inviteCardTitle")}</h2>
      <div className="border-border bg-surface flex min-h-0 flex-1 flex-col gap-4 rounded-2xl border p-5">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl">
            <Users size={22} className="text-primary" />
          </div>
          <div>
            <p className="text-muted mt-0.5 text-xs">{t("inviteCardDesc")}</p>
          </div>
        </div>

        {inviteCode && (
          <div className="border-border bg-background overflow-hidden rounded-2xl border">
            <div className="px-4 py-3">
              <p className="text-muted text-[11px]">{t("inviteCardCodeLabel")}</p>
              <p
                className="text-foreground mt-1 font-mono text-base font-bold tracking-[0.18em]"
                dir="ltr"
              >
                {inviteCode}
              </p>
            </div>
            <div className="border-border divide-border grid grid-cols-2 divide-x border-t">
              <button
                type="button"
                onClick={copyCode}
                className={cn(
                  "relative flex h-11 items-center justify-center gap-1.5 text-xs font-medium transition",
                  copiedCode
                    ? "bg-success/10 text-success"
                    : "text-muted hover:bg-surface-2 hover:text-foreground",
                )}
              >
                {/* Fixed-size content so copy feedback never shifts layout */}
                <span className="invisible inline-flex items-center gap-1.5 font-medium">
                  <Link2 className="size-3.5" />
                  {t("copyInviteLink")}
                </span>
                <span className="absolute inset-0 flex items-center justify-center gap-1.5">
                  {copiedCode ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copiedCode ? t("copied") : t("copyCode")}
                </span>
              </button>
              <button
                type="button"
                onClick={copyLink}
                className={cn(
                  "border-border relative flex h-11 items-center justify-center gap-1.5 border-s text-xs font-medium transition",
                  copiedLink
                    ? "bg-success/10 text-success"
                    : "text-muted hover:bg-surface-2 hover:text-foreground",
                )}
              >
                <span className="invisible inline-flex items-center gap-1.5 font-medium">
                  <Link2 className="size-3.5" />
                  {t("copyInviteLink")}
                </span>
                <span className="absolute inset-0 flex items-center justify-center gap-1.5">
                  {copiedLink ? <Check className="size-3.5" /> : <Link2 className="size-3.5" />}
                  {copiedLink ? t("copied") : t("copyInviteLink")}
                </span>
              </button>
            </div>
          </div>
        )}

        <VipInviteButton onClick={onVipInvite} />
      </div>
    </div>
  );
}

function MarketingBadgesPromo() {
  const t = useTranslations("network");
  const { data: badgeItems = [] } = useMarketingBadges();

  return <MarketingBadgesSection title={t("badgesPromoTitle")} items={badgeItems} compact />;
}

// ── Info Banner ───────────────────────────────────────────────────────────────

function InfoBanner() {
  const t = useTranslations("network");
  const router = useRouter();
  return (
    <div className="border-primary/20 bg-primary/5 px-pad-mol py-pad-atom-md flex items-center gap-3 rounded-2xl border">
      <Zap className="text-primary size-5 shrink-0" />
      <p className="text-foreground flex-1 text-sm">
        {t("infoBannerText")}{" "}
        <button
          onClick={() => router.push(ROUTES.RULES)}
          className="text-primary font-semibold underline underline-offset-2 transition hover:opacity-80"
        >
          {t("infoBannerLink")}
        </button>
      </p>
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────────

function InviteStatusBadge({ status }: { status: InviteStatus }) {
  const t = useTranslations("network");
  const map: Record<InviteStatus, string> = {
    pending_invite: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    pending_verification: "bg-surface text-muted border border-border",
    active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    suspended: "bg-warning/10 text-warning",
    closed: "bg-error/10 text-error",
  };
  const label: Record<InviteStatus, string> = {
    pending_invite: t("statusPending"),
    pending_verification: t("statusRegistered"),
    active: t("statusActive"),
    suspended: t("statusSuspended"),
    closed: t("statusClosed"),
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${map[status]}`}
    >
      {label[status]}
    </span>
  );
}

// ── Invited Table ─────────────────────────────────────────────────────────────

function InvitedTable() {
  const t = useTranslations("network");
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = (searchParams.get("status") ?? "all") as
    InviteStatus | "all" | "pending" | "registered";
  const q = searchParams.get("q") ?? "";

  const { data: items = [], isLoading } = useNetworkInvited(status, q);

  const setParam = (key: string, val: string) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (val === "" || val === "all") sp.delete(key);
    else sp.set(key, val);
    router.replace("?" + sp.toString(), { scroll: false });
  };

  const filterBtns: { value: InviteStatus | "all" | "pending" | "registered"; label: string }[] = [
    { value: "all", label: t("filterAll") },
    { value: "pending", label: t("filterPending") },
    { value: "registered", label: t("filterRegistered") },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-foreground text-base font-bold">{t("invitedTableTitle")}</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="border-border bg-surface flex items-center gap-1 rounded-xl border p-1">
            {filterBtns.map((btn) => (
              <button
                key={btn.value}
                type="button"
                onClick={() => setParam("status", btn.value)}
                className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                  status === btn.value
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={q}
            onChange={(e) => setParam("q", normalizeSearchInput(e.target.value))}
            placeholder={t("searchPlaceholder")}
            className="border-border bg-background text-foreground placeholder:text-muted focus:border-primary w-full rounded-xl border px-3 py-2 text-sm focus:outline-none sm:w-56"
            dir="rtl"
          />
        </div>
      </div>

      <div className="border-border bg-surface rounded-2xl border p-4">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-muted py-8 text-center text-sm">{t("emptyInvited")}</p>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden sm:block">
              <div className="border-border text-muted flex gap-3 border-b pb-2 text-xs font-medium">
                <span className="flex-1">{t("colName")}</span>
                <span className="w-32">{t("colMobile")}</span>
                <span className="w-28">{t("colStatus")}</span>
                <span className="w-28">{t("colJoinDate")}</span>
                <span className="w-14 text-center">{t("colLevel")}</span>
                <span className="w-14 text-center">{t("colSubsets")}</span>
              </div>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="border-border/50 flex items-center gap-3 border-b py-3 text-sm last:border-0"
                >
                  <span className="text-foreground flex-1 font-medium">{item.fullName}</span>
                  <span className="text-muted w-32 font-mono text-xs" dir="ltr">
                    {item.mobile}
                  </span>
                  <span className="w-28">
                    <InviteStatusBadge status={item.status} />
                  </span>
                  <span className="text-muted w-28 shrink-0 text-xs">
                    {formatDisplayDate(item.joinDate)}
                  </span>
                  <span className="text-muted w-14 text-center text-xs">{item.level ?? "—"}</span>
                  <span className="text-muted w-14 text-center text-xs">
                    {item.subMembersCount ?? "—"}
                  </span>
                </div>
              ))}
            </div>

            {/* Mobile cards */}
            <div className="flex flex-col gap-2 sm:hidden">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="border-border bg-background rounded-xl border px-3 py-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-foreground font-medium">{item.fullName}</span>
                    <InviteStatusBadge status={item.status} />
                  </div>
                  <div className="text-muted mt-1 flex items-center gap-3 text-xs">
                    <span dir="ltr">{item.mobile}</span>
                    {item.joinDate && <span>{formatDisplayDate(item.joinDate)}</span>}
                    {item.level != null && (
                      <span>
                        {t("level")} {item.level}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Page Root ─────────────────────────────────────────────────────────────────

export function NetworkPageClient() {
  const [showInviteModal, setShowInviteModal] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <NetworkTreeWidget stretch showEmptyInvite={false} minHeight={200} />
        </div>
        <InviteCard onVipInvite={() => setShowInviteModal(true)} />
      </div>

      <MarketingBadgesPromo />
      <InfoBanner />

      <InvitedTable />

      {showInviteModal && <InviteModal onClose={() => setShowInviteModal(false)} />}
    </div>
  );
}

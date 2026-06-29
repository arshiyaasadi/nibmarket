"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useTranslations } from "next-intl";
import { Users, Zap } from "lucide-react";
import { useNetworkInvited } from "@/features/network/queries";
import { useDashboardReferral } from "@/features/dashboard/queries";
import { useSession } from "@/hooks/use-session";
import { InviteModal } from "@/components/organisms/network/InviteModal";
import { VipInviteButton } from "@/components/molecules/VipInviteButton";
import { NetworkTreeWidget } from "@/components/organisms/network/NetworkTreeWidget";
import { ROUTES } from "@/config/routes";
import type { InviteStatus } from "@/types/mlm";
import { normalizeSearchInput } from "@/lib/normalization/digits";

function InviteCard({ onVipInvite }: { onVipInvite: () => void }) {
  const t = useTranslations("network");
  const { inviteCode: sessionInviteCode } = useSession();
  const { data: referralData } = useDashboardReferral();
  const inviteCode = referralData?.inviteCode ?? sessionInviteCode;
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(inviteCode ?? "").catch(() => { });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [inviteCode]);

  return (
    <div className="flex w-full min-h-0 flex-col gap-3 lg:w-[38%] lg:shrink-0">
      <h2 className="shrink-0 text-base font-bold text-foreground">{t("inviteCardTitle")}</h2>
      <div className="flex min-h-0 flex-1 flex-col gap-4 rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Users size={22} className="text-primary" />
        </div>
        <div>
          <p className="mt-0.5 text-xs text-muted">{t("inviteCardDesc")}</p>
        </div>
      </div>

      {inviteCode && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
          <div>
            <p className="text-[11px] text-muted">{t("inviteCardCodeLabel")}</p>
            <p className="mt-0.5 font-mono text-sm font-bold tracking-widest text-foreground" dir="ltr">
              {inviteCode}
            </p>
          </div>
          <button
            type="button"
            onClick={copy}
            className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-muted transition hover:text-foreground"
          >
            {copied ? t("copied") : t("copyCode")}
          </button>
        </div>
      )}

      <VipInviteButton onClick={onVipInvite} />
      </div>
    </div>
  );
}

// ── Info Banner ───────────────────────────────────────────────────────────────

function InfoBanner() {
  const t = useTranslations("network");
  const router = useRouter();
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-pad-mol py-pad-atom-md">
      <Zap className="size-5 shrink-0 text-primary" />
      <p className="flex-1 text-sm text-foreground">
        {t("infoBannerText")}{" "}
        <button
          onClick={() => router.push(ROUTES.RULES)}
          className="font-semibold text-primary underline underline-offset-2 transition hover:opacity-80"
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
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${map[status]}`}>
      {label[status]}
    </span>
  );
}

// ── Invited Table ─────────────────────────────────────────────────────────────

function InvitedTable() {
  const t = useTranslations("network");
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = (searchParams.get("status") ?? "all") as InviteStatus | "all" | "pending" | "registered";
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
        <h2 className="text-base font-bold text-foreground">{t("invitedTableTitle")}</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1">
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
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none sm:w-56"
            dir="rtl"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4">
      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">{t("emptyInvited")}</p>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden sm:block">
            <div className="flex gap-3 border-b border-border pb-2 text-xs font-medium text-muted">
              <span className="flex-1">{t("colName")}</span>
              <span className="w-32">{t("colMobile")}</span>
              <span className="w-28">{t("colStatus")}</span>
              <span className="w-28">{t("colJoinDate")}</span>
              <span className="w-14 text-center">{t("colLevel")}</span>
              <span className="w-14 text-center">{t("colSubsets")}</span>
            </div>
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 border-b border-border/50 py-3 text-sm last:border-0">
                <span className="flex-1 font-medium text-foreground">{item.fullName}</span>
                <span className="w-32 font-mono text-xs text-muted" dir="ltr">{item.mobile}</span>
                <span className="w-28"><InviteStatusBadge status={item.status} /></span>
                <span className="w-28 text-xs text-muted">{item.joinDate ?? "—"}</span>
                <span className="w-14 text-center text-xs text-muted">{item.level ?? "—"}</span>
                <span className="w-14 text-center text-xs text-muted">{item.subMembersCount ?? "—"}</span>
              </div>
            ))}
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-2 sm:hidden">
            {items.map((item) => (
              <div key={item.id} className="rounded-xl border border-border bg-background px-3 py-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{item.fullName}</span>
                  <InviteStatusBadge status={item.status} />
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                  <span dir="ltr">{item.mobile}</span>
                  {item.joinDate && <span>{item.joinDate}</span>}
                  {item.level != null && <span>{t("level")} {item.level}</span>}
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

      {/* Row 2: Info banner */}
      <InfoBanner />

      {/* Row 3: Invited table */}
      <InvitedTable />

      {showInviteModal && <InviteModal onClose={() => setShowInviteModal(false)} />}
    </div>
  );
}

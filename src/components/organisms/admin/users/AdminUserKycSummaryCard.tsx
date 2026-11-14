"use client";

import { useTranslations } from "next-intl";
import { ShieldCheck, ShieldOff } from "lucide-react";

interface Props {
  verifiedCount?: number;
  unverifiedCount?: number;
  isLoading?: boolean;
}

export function AdminUserKycSummaryCard({
  verifiedCount = 0,
  unverifiedCount = 0,
  isLoading,
}: Props) {
  const t = useTranslations("admin.users.kycSummary");

  if (isLoading) {
    return <div className="border-border bg-surface h-36 animate-pulse rounded-2xl border" />;
  }

  return (
    <div className="border-border bg-surface flex flex-col gap-5 rounded-2xl border p-5">
      <div>
        <h2 className="text-foreground text-sm font-semibold">{t("title")}</h2>
        <p className="text-muted mt-0.5 text-xs">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-muted text-xs">{t("verified")}</p>
            <p className="text-foreground mt-1 text-3xl font-bold tabular-nums">
              {verifiedCount.toLocaleString("fa-IR")}
            </p>
          </div>
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-green-500/10 text-green-600">
            <ShieldCheck size={22} />
          </div>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-muted text-xs">{t("unverified")}</p>
            <p className="text-foreground mt-1 text-3xl font-bold tabular-nums">
              {unverifiedCount.toLocaleString("fa-IR")}
            </p>
          </div>
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-700">
            <ShieldOff size={22} />
          </div>
        </div>
      </div>
    </div>
  );
}

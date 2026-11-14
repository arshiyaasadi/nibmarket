"use client";

import { useTranslations } from "next-intl";
import { ShieldCheck, ShieldOff, Users } from "lucide-react";

interface Props {
  totalUsers?: number;
  verifiedCount?: number;
  unverifiedCount?: number;
  isLoading?: boolean;
}

export function AdminUserKycSummaryCard({
  totalUsers = 0,
  verifiedCount = 0,
  unverifiedCount = 0,
  isLoading,
}: Props) {
  const t = useTranslations("admin.users.kycSummary");

  if (isLoading) {
    return <div className="border-border bg-surface h-40 animate-pulse rounded-2xl border" />;
  }

  return (
    <div className="border-border bg-surface flex flex-col gap-5 rounded-2xl border p-5">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-muted text-xs">{t("title")}</p>
          <p className="text-foreground mt-1 text-4xl font-bold tabular-nums">
            {totalUsers.toLocaleString("fa-IR")}
          </p>
        </div>
        <div className="bg-primary/10 text-primary flex size-14 shrink-0 items-center justify-center rounded-2xl">
          <Users size={24} />
        </div>
      </div>

      <div className="border-border grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-2">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-muted text-xs">{t("verified")}</p>
            <p className="text-foreground mt-1 text-2xl font-bold tabular-nums">
              {verifiedCount.toLocaleString("fa-IR")}
            </p>
          </div>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-600">
            <ShieldCheck size={18} />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-muted text-xs">{t("unverified")}</p>
            <p className="text-foreground mt-1 text-2xl font-bold tabular-nums">
              {unverifiedCount.toLocaleString("fa-IR")}
            </p>
          </div>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700">
            <ShieldOff size={18} />
          </div>
        </div>
      </div>
    </div>
  );
}

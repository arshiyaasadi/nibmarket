"use client";

import { useTranslations } from "next-intl";
import { Users, Venus, Mars } from "lucide-react";
import { AgeDistributionChart } from "@/components/molecules/AgeDistributionChart";
import type { AdminUsersDemographicsResponse } from "@/types/admin";

function GenderDonut({
  malePercent,
  femalePercent,
  maleCount,
  femaleCount,
}: {
  malePercent: number;
  femalePercent: number;
  maleCount: number;
  femaleCount: number;
}) {
  const t = useTranslations("admin.demographics");

  return (
    <div className="flex items-center gap-4">
      <div
        className="relative size-20 shrink-0 rounded-full"
        style={{
          background: `conic-gradient(#3b82f6 0 ${malePercent}%, #ec4899 ${malePercent}% 100%)`,
        }}
      >
        <div className="bg-surface absolute inset-2 flex items-center justify-center rounded-full">
          <span className="text-foreground text-xs font-bold tabular-nums">
            {t("percentTotal")}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-center gap-2 text-xs">
          <Mars size={14} className="text-blue-500" />
          <span className="text-foreground">{t("male")}</span>
          <span className="text-muted me-auto tabular-nums">
            {maleCount.toLocaleString("fa-IR")} · {malePercent.toLocaleString("fa-IR")}%
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Venus size={14} className="text-pink-500" />
          <span className="text-foreground">{t("female")}</span>
          <span className="text-muted me-auto tabular-nums">
            {femaleCount.toLocaleString("fa-IR")} · {femalePercent.toLocaleString("fa-IR")}%
          </span>
        </div>
      </div>
    </div>
  );
}

interface Props {
  data?: AdminUsersDemographicsResponse;
  isLoading?: boolean;
}

export function AdminUserDemographicsCards({ data, isLoading }: Props) {
  const t = useTranslations("admin.demographics");

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="border-border bg-surface h-64 animate-pulse rounded-2xl border" />
        ))}
      </div>
    );
  }

  const male = data?.genderDistribution.find((g) => g.gender === "male");
  const female = data?.genderDistribution.find((g) => g.gender === "female");

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="border-border bg-surface flex flex-col gap-4 rounded-2xl border p-5">
        <div>
          <h2 className="text-foreground text-sm font-semibold">{t("ageTitle")}</h2>
          <p className="text-muted mt-0.5 text-xs">{t("ageSubtitle")}</p>
        </div>
        <AgeDistributionChart data={data?.ageDistribution ?? []} />
      </div>

      <div className="border-border bg-surface flex flex-col gap-5 rounded-2xl border p-5">
        <div>
          <h2 className="text-foreground text-sm font-semibold">{t("totalTitle")}</h2>
          <p className="text-muted mt-0.5 text-xs">{t("totalSubtitle")}</p>
        </div>

        <div className="flex items-end justify-between gap-4">
          <p className="text-foreground text-4xl font-bold tabular-nums">
            {(data?.totalUsers ?? 0).toLocaleString("fa-IR")}
          </p>
          <div className="bg-primary/10 text-primary flex size-14 items-center justify-center rounded-2xl">
            <Users size={24} />
          </div>
        </div>

        <div className="border-border border-t pt-4">
          <p className="text-foreground mb-3 text-xs font-semibold">{t("genderSection")}</p>
          <GenderDonut
            malePercent={male?.percent ?? 0}
            femalePercent={female?.percent ?? 0}
            maleCount={male?.count ?? 0}
            femaleCount={female?.count ?? 0}
          />
        </div>
      </div>
    </div>
  );
}

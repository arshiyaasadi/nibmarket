"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, Package, PackageOpen } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ROUTES } from "@/config/routes";
import {
  getTwinTreasurySharePercent,
  isTwinTreasuryLow,
  TWIN_TREASURY_LOW_SHARE_PERCENT,
} from "@/lib/admin/twin-treasury";
import type { AdminTwinOverviewResponse } from "@/types/admin";

const PIE_COLORS = {
  allocated: "#0d9488",
  frozen: "#d97706",
  unallocated: "#64748b",
};

function pn(value: number) {
  return value.toLocaleString("fa-IR");
}

type TwinCompositionCardProps = {
  overview?: AdminTwinOverviewResponse;
  isLoading?: boolean;
  /** Main Twin overview: show treasury share % + alert / manage link */
  showTreasuryNav?: boolean;
};

export function TwinCompositionCard({
  overview,
  isLoading,
  showTreasuryNav = false,
}: TwinCompositionCardProps) {
  const t = useTranslations("admin.twin");

  const pieData = useMemo(() => {
    const allocated = overview?.allocatedTokens ?? 0;
    const frozen = overview?.totalFrozenTokens ?? 0;
    const unallocated = overview?.unallocatedTokens ?? 0;
    const liquid = Math.max(allocated - frozen, 0);
    return [
      { key: "allocated", name: t("pieAllocated"), value: liquid },
      { key: "frozen", name: t("pieFrozen"), value: frozen },
      { key: "unallocated", name: t("pieUnallocated"), value: unallocated },
    ].filter((item) => item.value > 0);
  }, [overview, t]);

  const treasuryShare = overview != null ? getTwinTreasurySharePercent(overview) : null;
  const treasuryLow = overview != null ? isTwinTreasuryLow(overview) : false;
  const shareDisplay =
    treasuryShare === null ? null : Number(treasuryShare.toFixed(treasuryShare < 10 ? 1 : 0));

  return (
    <div className="border-border bg-surface rounded-2xl border p-5">
      {isLoading ? (
        <div className="h-44 animate-pulse rounded-xl bg-black/5 dark:bg-white/5" />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative h-44 w-full shrink-0 sm:w-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={68}
                    paddingAngle={2}
                    stroke="transparent"
                    isAnimationActive={false}
                  >
                    {pieData.map((entry) => (
                      <Cell
                        key={entry.key}
                        fill={
                          entry.key === "allocated"
                            ? PIE_COLORS.allocated
                            : entry.key === "frozen"
                              ? PIE_COLORS.frozen
                              : PIE_COLORS.unallocated
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    cursor={false}
                    allowEscapeViewBox={{ x: true, y: true }}
                    offset={10}
                    wrapperStyle={{
                      outline: "none",
                      zIndex: 20,
                      pointerEvents: "none",
                      width: "auto",
                      height: "auto",
                    }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const item = payload[0];
                      const value =
                        typeof item.value === "number" ? item.value : Number(item.value ?? 0);
                      return (
                        <div className="border-border bg-surface rounded-xl border px-3 py-2 text-xs shadow-lg">
                          <p className="text-muted mb-0.5 text-[11px]">{String(item.name ?? "")}</p>
                          <p className="text-foreground font-semibold tabular-nums">
                            {pn(value)} {t("tokenUnit")}
                          </p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <p className="text-foreground text-xs font-semibold">{t("pieTitle")}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-muted text-xs">{t("allocatedTokens")}</p>
                    <p className="text-foreground mt-1 text-xl font-bold tabular-nums">
                      {pn(overview?.allocatedTokens ?? 0)}{" "}
                      <span className="text-muted text-xs font-normal">{t("tokenUnit")}</span>
                    </p>
                  </div>
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-700">
                    <Package size={18} />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-muted text-xs">{t("unallocatedTokens")}</p>
                    <p className="text-foreground mt-1 text-xl font-bold tabular-nums">
                      {pn(overview?.unallocatedTokens ?? 0)}{" "}
                      <span className="text-muted text-xs font-normal">{t("tokenUnit")}</span>
                    </p>
                  </div>
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-500/10 text-slate-600">
                    <PackageOpen size={18} />
                  </div>
                </div>
              </div>
              <ul className="border-border flex flex-col gap-1.5 border-t pt-3 text-[11px]">
                <li className="flex items-center justify-between gap-2">
                  <span className="text-muted flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: PIE_COLORS.allocated }}
                    />
                    {t("pieAllocated")}
                  </span>
                  <span className="tabular-nums">
                    {pn(
                      Math.max(
                        (overview?.allocatedTokens ?? 0) - (overview?.totalFrozenTokens ?? 0),
                        0,
                      ),
                    )}
                  </span>
                </li>
                <li className="flex items-center justify-between gap-2">
                  <span className="text-muted flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: PIE_COLORS.frozen }}
                    />
                    {t("pieFrozen")}
                  </span>
                  <span className="tabular-nums">{pn(overview?.totalFrozenTokens ?? 0)}</span>
                </li>
                <li className="flex items-center justify-between gap-2">
                  <span className="text-muted flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: PIE_COLORS.unallocated }}
                    />
                    {t("pieUnallocated")}
                  </span>
                  <span className="tabular-nums">{pn(overview?.unallocatedTokens ?? 0)}</span>
                </li>
              </ul>
            </div>
          </div>

          {showTreasuryNav && shareDisplay !== null && (
            <div className="border-border flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-muted text-[11px]">{t("treasuryShareLabel")}</p>
                <p className="text-foreground mt-0.5 text-lg font-bold tabular-nums">
                  {pn(shareDisplay)}٪
                </p>
                <p className="text-muted mt-0.5 text-[11px]">
                  {t("treasuryShareHint", { threshold: pn(TWIN_TREASURY_LOW_SHARE_PERCENT) })}
                </p>
              </div>

              {treasuryLow ? (
                <Link
                  href={ROUTES.ADMIN.TWIN_TREASURY}
                  className="inline-flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-800 transition-colors hover:bg-amber-500/15 dark:text-amber-200"
                >
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  <span className="flex flex-col gap-0.5">
                    <span className="font-semibold">{t("treasuryAlertTitle")}</span>
                    <span className="opacity-90">{t("treasuryAlertBody")}</span>
                  </span>
                </Link>
              ) : (
                <Link
                  href={ROUTES.ADMIN.TWIN_TREASURY}
                  className="border-border text-primary hover:bg-surface-2 inline-flex items-center justify-center rounded-xl border px-3 py-2 text-xs font-medium transition-colors"
                >
                  {t("manageTreasury")}
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { Activity, RefreshCw } from "lucide-react";
import type { AdminMissionJobHealthStatus, AdminSedimentJobResponse } from "@/types/admin";
import { formatDisplayDateTime } from "@/lib/utils";

const HEALTH_COLORS: Record<AdminMissionJobHealthStatus, string> = {
  healthy: "bg-green-500/10 text-green-600",
  degraded: "bg-yellow-500/10 text-yellow-600",
  down: "bg-red-500/10 text-red-600",
  unknown: "bg-gray-500/10 text-gray-500",
};

function formatDateTime(value: string | null) {
  return formatDisplayDateTime(value);
}

export function AdminSedimentJobCard({
  data,
  isLoading,
  isRefreshing,
  onRefresh,
}: {
  data?: AdminSedimentJobResponse;
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
}) {
  const t = useTranslations("admin.sediment.job");

  return (
    <section className="border-border bg-surface flex flex-col gap-4 rounded-2xl border p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
            <Activity size={16} />
          </div>
          <div>
            <h2 className="text-foreground text-sm font-semibold">{t("title")}</h2>
            <p className="text-muted text-xs">{t("subtitle")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {data && (
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${HEALTH_COLORS[data.status]}`}
            >
              {t(`status.${data.status}`)}
            </span>
          )}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="border-border text-muted hover:text-foreground flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs disabled:opacity-60"
          >
            <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
            {t("refresh")}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-muted/20 h-16 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border-border rounded-xl border p-3">
              <p className="text-muted text-[11px]">{t("jobName")}</p>
              <p className="text-foreground mt-1 text-xs font-medium">{data.jobName}</p>
              <p className="text-muted mt-0.5 font-mono text-[10px]" dir="ltr">
                {data.jobId}
              </p>
            </div>
            <div className="border-border rounded-xl border p-3">
              <p className="text-muted text-[11px]">{t("lastRun")}</p>
              <p className="text-foreground mt-1 text-xs tabular-nums">
                {formatDateTime(data.lastRunAt)}
              </p>
            </div>
            <div className="border-border rounded-xl border p-3">
              <p className="text-muted text-[11px]">{t("nextRun")}</p>
              <p className="text-foreground mt-1 text-xs tabular-nums">
                {formatDateTime(data.nextRunAt)}
              </p>
            </div>
            <div className="border-border rounded-xl border p-3">
              <p className="text-muted text-[11px]">{t("schedule")}</p>
              <p className="text-foreground mt-1 font-mono text-xs" dir="ltr">
                {data.schedule}
              </p>
            </div>
          </div>
          <div className="text-muted flex flex-wrap gap-4 text-[11px]">
            <span>
              {t("processedAssets")}:{" "}
              <span className="text-foreground font-medium tabular-nums">
                {data.processedAssets.toLocaleString("fa-IR")}
              </span>
            </span>
            <span>
              {t("distributedTwin")}:{" "}
              <span className="text-primary font-medium tabular-nums">
                {data.distributedTwin.toLocaleString("fa-IR")} TWIN
              </span>
            </span>
            <span>
              {t("lastSuccess")}:{" "}
              <span className="text-foreground tabular-nums">
                {formatDateTime(data.lastSuccessAt)}
              </span>
            </span>
          </div>
        </>
      ) : null}
    </section>
  );
}

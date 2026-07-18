"use client";

import { useTranslations } from "next-intl";
import { RefreshCw, Activity } from "lucide-react";
import type { AdminMissionJobsHealthResponse, AdminMissionJobHealthStatus } from "@/types/admin";

const HEALTH_COLORS: Record<AdminMissionJobHealthStatus, string> = {
  healthy: "bg-green-500/10 text-green-600",
  degraded: "bg-yellow-500/10 text-yellow-600",
  down: "bg-red-500/10 text-red-600",
  unknown: "bg-gray-500/10 text-gray-500",
};

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "short", timeStyle: "short" }).format(
    new Date(value),
  );
}

export function AdminMissionJobsHealth({
  data,
  isLoading,
  isRefreshing,
  onRefresh,
}: {
  data?: AdminMissionJobsHealthResponse;
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
}) {
  const t = useTranslations("admin.missions.health");

  const overallStatus = data?.overallStatus ?? "unknown";

  return (
    <section className="border-border bg-surface flex flex-col gap-4 rounded-2xl border p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-xl">
              <Activity size={16} />
            </div>
            <div>
              <h2 className="text-foreground text-sm font-semibold">{t("title")}</h2>
              <p className="text-muted text-xs">{t("subtitle")}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {data && (
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${HEALTH_COLORS[overallStatus]}`}
            >
              {t(`status.${overallStatus}`)}
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

      {data && (
        <p className="text-muted text-[11px]">
          {t("checkedAt", { time: formatDateTime(data.checkedAt) })}
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-right text-xs">
          <thead>
            <tr className="text-muted border-border border-b">
              <th className="px-3 py-2 font-medium">{t("columns.mission")}</th>
              <th className="px-3 py-2 font-medium">{t("columns.job")}</th>
              <th className="px-3 py-2 font-medium">{t("columns.status")}</th>
              <th className="px-3 py-2 font-medium">{t("columns.lastRun")}</th>
              <th className="px-3 py-2 font-medium">{t("columns.nextRun")}</th>
              <th className="px-3 py-2 font-medium">{t("columns.latency")}</th>
              <th className="px-3 py-2 font-medium">{t("columns.message")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-border border-b">
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="px-3 py-3">
                      <div className="bg-muted/20 h-4 animate-pulse rounded" />
                    </td>
                  ))}
                </tr>
              ))}
            {!isLoading &&
              (data?.jobs ?? []).map((job) => (
                <tr key={job.jobId} className="border-border border-b last:border-0">
                  <td className="px-3 py-3">
                    <p className="text-foreground font-medium">{job.missionTitle}</p>
                    <p className="text-muted font-mono text-[10px]" dir="ltr">
                      {job.missionCode}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-foreground">{job.jobName}</p>
                    <p className="text-muted font-mono text-[10px]" dir="ltr">
                      {job.jobId}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${HEALTH_COLORS[job.status]}`}
                    >
                      {t(`status.${job.status}`)}
                    </span>
                  </td>
                  <td className="px-3 py-3 tabular-nums">{formatDateTime(job.lastRunAt)}</td>
                  <td className="px-3 py-3 tabular-nums">{formatDateTime(job.nextRunAt)}</td>
                  <td className="px-3 py-3 tabular-nums" dir="ltr">
                    {job.latencyMs != null ? `${job.latencyMs.toLocaleString("fa-IR")} ms` : "—"}
                  </td>
                  <td className="text-muted px-3 py-3">
                    {job.message ? t(`messages.${job.message}`) : "—"}
                  </td>
                </tr>
              ))}
            {!isLoading && (data?.jobs.length ?? 0) === 0 && (
              <tr>
                <td colSpan={7} className="text-muted px-3 py-6 text-center">
                  {t("empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

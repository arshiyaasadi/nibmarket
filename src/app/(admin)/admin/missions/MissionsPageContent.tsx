"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { Cog, Target } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { DataTable } from "@/components/ui/DataTable";
import { AdminOverviewStatCard } from "@/components/molecules/AdminOverviewStatCard";
import { AdminTableToolbar } from "@/components/molecules/AdminTableToolbar";
import { AdminMissionJobsHealth } from "@/components/organisms/admin/missions/AdminMissionJobsHealth";
import { normalizeAdminMissionList } from "@/lib/admin/mission-jobs";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { formatDisplayDateTime } from "@/lib/utils";
import {
  isMehrPreviewMissionId,
  MEHR_MISSIONS,
  mergeMehrAdminMissions,
  shouldMergeMehrAdminPreview,
} from "@/resources/data/mehr-missions";
import type {
  AdminMissionCompletionRow,
  AdminMissionCompletionsResponse,
  AdminMissionJobsHealthResponse,
  AdminMissionListItem,
  AdminMissionStatus,
  AdminMissionsListResponse,
  AdminMissionsOverviewResponse,
  UpdateAdminMissionStatusRequest,
} from "@/types/admin";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500/10 text-green-600",
  paused: "bg-yellow-500/10 text-yellow-600",
  draft: "bg-gray-500/10 text-gray-500",
  archived: "bg-red-500/10 text-red-500",
};

function formatDateTime(iso: string) {
  return formatDisplayDateTime(iso);
}

export default function MissionsPageContent() {
  const t = useTranslations("admin.missions");
  const qc = useQueryClient();
  const [missionsPagination, setMissionsPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [missionsSearchInput, setMissionsSearchInput] = useState("");
  const missionsSearch = useDebouncedValue(missionsSearchInput);
  const [completionsPagination, setCompletionsPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 8,
  });

  function handleMissionsSearchChange(value: string) {
    setMissionsSearchInput(value);
    setMissionsPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 }));
  }

  const { data: overview, isLoading: overviewLoading } = useQuery<AdminMissionsOverviewResponse>({
    queryKey: ["admin", "missions", "overview"],
    queryFn: () => apiClient.get(ENDPOINTS.ADMIN.MISSIONS.OVERVIEW),
  });

  const { data: missionsData, isLoading } = useQuery<AdminMissionsListResponse>({
    queryKey: ["admin", "missions", "list", missionsPagination, missionsSearch],
    queryFn: async () => {
      const result = await apiClient.get<AdminMissionsListResponse>(
        `${ENDPOINTS.ADMIN.MISSIONS.LIST}?page=${missionsPagination.pageIndex}&pageSize=${missionsPagination.pageSize}&search=${encodeURIComponent(missionsSearch)}`,
      );
      const normalized = normalizeAdminMissionList(result.data);
      // TEMP mlm-15: show marketing missions not yet seeded by backend (page 0, no search)
      if (
        missionsPagination.pageIndex === 0 &&
        !missionsSearch.trim() &&
        shouldMergeMehrAdminPreview(result.total)
      ) {
        const { data, appended } = mergeMehrAdminMissions(normalized);
        return {
          ...result,
          data,
          total: result.total + appended,
          pageCount: Math.max(
            result.pageCount,
            Math.ceil((result.total + appended) / Math.max(result.pageSize, 1)),
          ),
        };
      }
      return { ...result, data: normalized };
    },
  });

  const {
    data: jobsHealth,
    isLoading: healthLoading,
    isFetching: healthRefreshing,
    refetch: refetchHealth,
  } = useQuery<AdminMissionJobsHealthResponse>({
    queryKey: ["admin", "missions", "jobs-health"],
    queryFn: () => apiClient.get(ENDPOINTS.ADMIN.MISSIONS.JOBS_HEALTH),
  });

  const { data: completions, isLoading: completionsLoading } =
    useQuery<AdminMissionCompletionsResponse>({
      queryKey: ["admin", "missions", "completions", completionsPagination],
      queryFn: () =>
        apiClient.get(
          `${ENDPOINTS.ADMIN.MISSIONS.COMPLETIONS}?page=${completionsPagination.pageIndex}&pageSize=${completionsPagination.pageSize}`,
        ),
    });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AdminMissionStatus }) =>
      apiClient.patch(ENDPOINTS.ADMIN.MISSIONS.UPDATE_STATUS(id), {
        status,
      } satisfies UpdateAdminMissionStatusRequest),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "missions"] });
    },
  });

  const missionTypeLabels: Record<string, string> = {
    referral_count: t("types.referral_count"),
    purchase: t("types.purchase"),
    registration: t("types.registration"),
    fund_issue: t("types.fund_issue"),
    custom: t("types.custom"),
  };

  const columns = useMemo<ColumnDef<AdminMissionListItem, unknown>[]>(
    () => [
      {
        accessorKey: "code",
        header: t("columns.code"),
        cell: ({ getValue }) => (
          <span className="font-mono text-xs" dir="ltr">
            {String(getValue())}
          </span>
        ),
      },
      { accessorKey: "title", header: t("columns.title") },
      {
        accessorKey: "missionType",
        header: t("columns.type"),
        cell: ({ getValue }) => (
          <span className="text-muted text-xs">
            {missionTypeLabels[String(getValue())] ?? String(getValue())}
          </span>
        ),
      },
      {
        accessorKey: "rewardAmount",
        header: t("columns.reward"),
        cell: ({ getValue }) => (
          <span className="text-primary font-semibold">
            {Number(getValue()).toLocaleString("fa-IR")}
          </span>
        ),
      },
      {
        id: "job",
        header: t("columns.job"),
        cell: ({ row }) => {
          const job = row.original.job;
          if (!job) return "—";
          return (
            <div>
              <p className="text-xs">{job.jobName}</p>
              <p className="text-muted font-mono text-[10px]" dir="ltr">
                {job.jobId}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: t("columns.status"),
        cell: ({ getValue }) => {
          const status = String(getValue());
          return (
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_COLORS[status] ?? ""}`}
            >
              {t(`status.${status}` as "status.active")}
            </span>
          );
        },
      },
      {
        accessorKey: "verificationMode",
        header: t("columns.verification"),
        cell: ({ getValue }) => (
          <span className="text-muted text-xs">
            {t(`verification.${String(getValue())}` as "verification.auto")}
          </span>
        ),
      },
      {
        id: "actions",
        header: t("columns.actions"),
        cell: ({ row }) => {
          const isPreview = isMehrPreviewMissionId(row.original.id);
          const isActive = row.original.status === "active";
          const isPending =
            statusMutation.isPending && statusMutation.variables?.id === row.original.id;

          return (
            <button
              type="button"
              disabled={
                isPreview ||
                isPending ||
                row.original.status === "draft" ||
                row.original.status === "archived"
              }
              onClick={() =>
                statusMutation.mutate({
                  id: row.original.id,
                  status: isActive ? "paused" : "active",
                })
              }
              className={`rounded-lg px-2.5 py-1 text-[11px] font-medium disabled:opacity-50 ${
                isActive
                  ? "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20"
                  : "bg-green-500/10 text-green-600 hover:bg-green-500/20"
              }`}
              title={isPreview ? t("previewPendingBackend") : undefined}
            >
              {isPending ? t("toggling") : isActive ? t("deactivate") : t("activate")}
            </button>
          );
        },
      },
    ],
    [missionTypeLabels, statusMutation.isPending, statusMutation.variables?.id, t],
  );

  const completionColumns = useMemo<ColumnDef<AdminMissionCompletionRow, unknown>[]>(
    () => [
      {
        accessorKey: "completedAt",
        header: t("completionColumns.completedAt"),
        cell: ({ getValue }) => (
          <span className="text-muted text-xs tabular-nums">
            {formatDateTime(String(getValue()))}
          </span>
        ),
      },
      {
        accessorKey: "userFullName",
        header: t("completionColumns.user"),
        cell: ({ getValue }) => <span className="text-sm font-medium">{String(getValue())}</span>,
      },
      {
        accessorKey: "userMobile",
        header: t("completionColumns.mobile"),
        cell: ({ getValue }) => (
          <span className="text-muted text-xs" dir="ltr">
            {String(getValue())}
          </span>
        ),
      },
      {
        id: "mission",
        header: t("completionColumns.mission"),
        cell: ({ row }) => (
          <div>
            <p className="text-sm">{row.original.missionTitle}</p>
            <p className="text-muted font-mono text-[10px]" dir="ltr">
              {row.original.missionCode}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "rewardAmount",
        header: t("completionColumns.reward"),
        cell: ({ getValue }) => (
          <span className="text-primary font-semibold tabular-nums">
            {Number(getValue()).toLocaleString("fa-IR")}
          </span>
        ),
      },
    ],
    [t],
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-foreground text-xl font-bold">{t("title")}</h1>
        <p className="text-muted mt-1 text-xs">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {overviewLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="border-border bg-surface h-24 animate-pulse rounded-2xl border"
            />
          ))
        ) : (
          <>
            <AdminOverviewStatCard
              label={t("totalMissions")}
              value={(shouldMergeMehrAdminPreview(overview?.missionCount ?? 0)
                ? MEHR_MISSIONS.length
                : (overview?.missionCount ?? 0)
              ).toLocaleString("fa-IR")}
              hint={t("activeMissionsHint", {
                count: shouldMergeMehrAdminPreview(overview?.missionCount ?? 0)
                  ? MEHR_MISSIONS.length
                  : (overview?.activeMissionCount ?? 0),
              })}
              icon={Target}
              iconClassName="bg-primary/10 text-primary"
            />
            <AdminOverviewStatCard
              label={t("totalJobs")}
              value={(overview?.jobCount ?? 0).toLocaleString("fa-IR")}
              hint={t("jobsHint")}
              icon={Cog}
              iconClassName="bg-blue-500/10 text-blue-600"
            />
          </>
        )}
      </div>

      <AdminMissionJobsHealth
        data={jobsHealth}
        isLoading={healthLoading}
        isRefreshing={healthRefreshing}
        onRefresh={() => refetchHealth()}
      />

      <div>
        <div className="mb-3">
          <h2 className="text-foreground text-sm font-semibold">{t("listTitle")}</h2>
          <p className="text-muted text-xs">{t("listSubtitle")}</p>
        </div>

        <AdminTableToolbar
          value={missionsSearchInput}
          onChange={handleMissionsSearchChange}
          placeholder={t("searchPlaceholder")}
          total={missionsData?.total}
          totalLabel={(count) => t("tableCount", { count })}
        />

        <DataTable
          data={missionsData?.data ?? []}
          columns={columns}
          pageCount={missionsData?.pageCount}
          total={missionsData?.total}
          pagination={missionsPagination}
          onPaginationChange={setMissionsPagination}
          isLoading={isLoading}
          emptyMessage={t("empty")}
        />
      </div>

      <div>
        <div className="mb-3">
          <div>
            <h2 className="text-foreground text-sm font-semibold">{t("completionsTitle")}</h2>
            <p className="text-muted text-xs">{t("completionsSubtitle")}</p>
          </div>
        </div>
        <DataTable
          data={completions?.data ?? []}
          columns={completionColumns}
          isLoading={completionsLoading}
          emptyMessage={t("completionsEmpty")}
          pagination={completionsPagination}
          pageCount={completions?.pageCount}
          total={completions?.total}
          onPaginationChange={setCompletionsPagination}
        />
      </div>
    </div>
  );
}

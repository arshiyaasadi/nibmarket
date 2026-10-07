"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { Clock, Layers, Users, Wallet } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { AdminOverviewStatCard } from "@/components/molecules/AdminOverviewStatCard";
import { AdminTableToolbar } from "@/components/molecules/AdminTableToolbar";
import { DataTable } from "@/components/ui/DataTable";
import { AdminSedimentJobCard } from "@/components/organisms/admin/sediment/AdminSedimentJobCard";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { formatDisplayDateTime } from "@/lib/utils";
import type {
  AdminNibMarketAssetRow,
  AdminNibMarketAssetsResponse,
  AdminSedimentDepositRow,
  AdminSedimentDepositsResponse,
  AdminSedimentJobResponse,
  AdminSedimentOverviewResponse,
} from "@/types/admin";
import type { SubsetDepositStatus } from "@/types/mlm";

const DEPOSIT_STATUS_COLORS: Record<string, string> = {
  calculated: "bg-yellow-500/10 text-yellow-700",
  credited: "bg-green-500/10 text-green-600",
  reversed: "bg-gray-500/10 text-gray-600",
  failed: "bg-red-500/10 text-red-600",
};

const STATUS_FILTERS: Array<{ value: string; labelKey: string }> = [
  { value: "", labelKey: "allStatuses" },
  { value: "calculated", labelKey: "status.calculated" },
  { value: "credited", labelKey: "status.credited" },
  { value: "reversed", labelKey: "status.reversed" },
  { value: "failed", labelKey: "status.failed" },
];

function formatDateTime(iso: string) {
  return formatDisplayDateTime(iso);
}

export default function SedimentPageContent() {
  const t = useTranslations("admin.sediment");
  const [assetsPagination, setAssetsPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [depositsPagination, setDepositsPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [assetsSearchInput, setAssetsSearchInput] = useState("");
  const assetsSearch = useDebouncedValue(assetsSearchInput);
  const [depositsSearchInput, setDepositsSearchInput] = useState("");
  const depositsSearch = useDebouncedValue(depositsSearchInput);
  const [statusFilter, setStatusFilter] = useState("");

  function handleAssetsSearchChange(value: string) {
    setAssetsSearchInput(value);
    setAssetsPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 }));
  }

  function handleDepositsSearchChange(value: string) {
    setDepositsSearchInput(value);
    setDepositsPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 }));
  }

  function handleStatusFilterChange(value: string) {
    setStatusFilter(value);
    setDepositsPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 }));
  }

  const { data: overview, isLoading: overviewLoading } = useQuery<AdminSedimentOverviewResponse>({
    queryKey: ["admin", "sediment", "overview"],
    queryFn: () => apiClient.get(ENDPOINTS.ADMIN.SEDIMENT.OVERVIEW),
  });

  const {
    data: job,
    isLoading: jobLoading,
    isFetching: jobRefreshing,
    refetch: refetchJob,
  } = useQuery<AdminSedimentJobResponse>({
    queryKey: ["admin", "sediment", "job"],
    queryFn: () => apiClient.get(ENDPOINTS.ADMIN.SEDIMENT.JOB),
  });

  const { data: assets, isLoading: assetsLoading } = useQuery<AdminNibMarketAssetsResponse>({
    queryKey: ["admin", "sediment", "assets", assetsPagination, assetsSearch],
    queryFn: () =>
      apiClient.get(
        `${ENDPOINTS.ADMIN.SEDIMENT.ASSETS}?page=${assetsPagination.pageIndex}&pageSize=${assetsPagination.pageSize}&search=${encodeURIComponent(assetsSearch)}`,
      ),
  });

  const { data: deposits, isLoading: depositsLoading } = useQuery<AdminSedimentDepositsResponse>({
    queryKey: ["admin", "sediment", "deposits", depositsPagination, depositsSearch, statusFilter],
    queryFn: () =>
      apiClient.get(
        `${ENDPOINTS.ADMIN.SEDIMENT.DEPOSITS}?page=${depositsPagination.pageIndex}&pageSize=${depositsPagination.pageSize}&search=${encodeURIComponent(depositsSearch)}&status=${statusFilter}`,
      ),
  });

  const assetColumns = useMemo<ColumnDef<AdminNibMarketAssetRow, unknown>[]>(
    () => [
      {
        accessorKey: "fullName",
        header: t("assetColumns.user"),
        cell: ({ getValue }) => <span className="font-medium">{String(getValue())}</span>,
      },
      {
        accessorKey: "mobile",
        header: t("assetColumns.mobile"),
        cell: ({ getValue }) => (
          <span className="text-muted text-xs" dir="ltr">
            {String(getValue())}
          </span>
        ),
      },
      {
        accessorKey: "fundName",
        header: t("assetColumns.fund"),
        cell: ({ row }) => (
          <div>
            <p className="text-sm">{row.original.fundName}</p>
            <p className="text-muted font-mono text-[10px]" dir="ltr">
              {row.original.fundId}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "assetValueRial",
        header: t("assetColumns.value"),
        cell: ({ getValue }) => (
          <span className="font-semibold tabular-nums">
            {Number(getValue()).toLocaleString("fa-IR")}
          </span>
        ),
      },
      {
        accessorKey: "profitRatePercent",
        header: t("assetColumns.profitRate"),
        cell: ({ getValue }) => (
          <span className="text-muted tabular-nums">
            {Number(getValue()).toLocaleString("fa-IR")}٪
          </span>
        ),
      },
      {
        accessorKey: "syncedAt",
        header: t("assetColumns.syncedAt"),
        cell: ({ getValue }) => (
          <span className="text-muted text-xs tabular-nums">
            {formatDateTime(String(getValue()))}
          </span>
        ),
      },
    ],
    [t],
  );

  const depositColumns = useMemo<ColumnDef<AdminSedimentDepositRow, unknown>[]>(
    () => [
      {
        accessorKey: "processedAt",
        header: t("depositColumns.processedAt"),
        cell: ({ getValue }) => (
          <span className="text-muted text-xs tabular-nums">
            {formatDateTime(String(getValue()))}
          </span>
        ),
      },
      {
        accessorKey: "beneficiaryName",
        header: t("depositColumns.beneficiary"),
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-medium">{row.original.beneficiaryName}</p>
            <p className="text-muted text-xs" dir="ltr">
              {row.original.beneficiaryMobile}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "sourceUserName",
        header: t("depositColumns.source"),
        cell: ({ getValue }) => <span className="text-sm">{String(getValue())}</span>,
      },
      {
        accessorKey: "level",
        header: t("depositColumns.level"),
        cell: ({ getValue }) => (
          <span className="text-muted tabular-nums">
            {Number(getValue()).toLocaleString("fa-IR")}
          </span>
        ),
      },
      {
        accessorKey: "baseAmountRial",
        header: t("depositColumns.baseAmount"),
        cell: ({ getValue }) => (
          <span className="tabular-nums">{Number(getValue()).toLocaleString("fa-IR")}</span>
        ),
      },
      {
        accessorKey: "ratePercent",
        header: t("depositColumns.rate"),
        cell: ({ getValue }) => (
          <span className="text-muted tabular-nums">
            {Number(getValue()).toLocaleString("fa-IR")}٪
          </span>
        ),
      },
      {
        accessorKey: "sedimentTwin",
        header: t("depositColumns.sediment"),
        cell: ({ getValue }) => (
          <span className="text-primary font-semibold tabular-nums">
            {Number(getValue()).toLocaleString("fa-IR")}
          </span>
        ),
      },
      {
        accessorKey: "fundName",
        header: t("depositColumns.fund"),
        cell: ({ getValue }) => <span className="text-xs">{String(getValue())}</span>,
      },
      {
        accessorKey: "status",
        header: t("depositColumns.status"),
        cell: ({ getValue }) => {
          const status = String(getValue()) as SubsetDepositStatus;
          return (
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${DEPOSIT_STATUS_COLORS[status] ?? ""}`}
            >
              {t(`status.${status}`)}
            </span>
          );
        },
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="border-border bg-surface h-24 animate-pulse rounded-2xl border"
            />
          ))
        ) : (
          <>
            <AdminOverviewStatCard
              label={t("totalAssets")}
              value={(overview?.totalAssetValueRial ?? 0).toLocaleString("fa-IR")}
              unit={t("rialUnit")}
              hint={t("assetRecordsHint", { count: overview?.assetRecordsCount ?? 0 })}
              icon={Wallet}
              iconClassName="bg-primary/10 text-primary"
            />
            <AdminOverviewStatCard
              label={t("linkedUsers")}
              value={(overview?.linkedUsersCount ?? 0).toLocaleString("fa-IR")}
              icon={Users}
              iconClassName="bg-blue-500/10 text-blue-600"
            />
            <AdminOverviewStatCard
              label={t("todaySediment")}
              value={(overview?.todaySedimentTwin ?? 0).toLocaleString("fa-IR")}
              unit="تنوین"
              hint={t("monthSedimentHint", { count: overview?.monthSedimentTwin ?? 0 })}
              icon={Layers}
              iconClassName="bg-green-500/10 text-green-600"
            />
            <AdminOverviewStatCard
              label={t("pendingSediment")}
              value={(overview?.pendingSedimentTwin ?? 0).toLocaleString("fa-IR")}
              unit="تنوین"
              icon={Clock}
              iconClassName="bg-yellow-500/10 text-yellow-700"
            />
          </>
        )}
      </div>

      <AdminSedimentJobCard
        data={job}
        isLoading={jobLoading}
        isRefreshing={jobRefreshing}
        onRefresh={() => refetchJob()}
      />

      <div>
        <div className="mb-3">
          <h2 className="text-foreground text-sm font-semibold">{t("assetsTitle")}</h2>
          <p className="text-muted text-xs">{t("assetsSubtitle")}</p>
        </div>

        <AdminTableToolbar
          value={assetsSearchInput}
          onChange={handleAssetsSearchChange}
          placeholder={t("searchPlaceholder")}
          total={assets?.total}
          totalLabel={(count) => t("assetsCount", { count })}
        />

        <DataTable
          data={assets?.data ?? []}
          columns={assetColumns}
          isLoading={assetsLoading}
          emptyMessage={t("assetsEmpty")}
          pagination={assetsPagination}
          pageCount={assets?.pageCount}
          total={assets?.total}
          onPaginationChange={setAssetsPagination}
        />
      </div>

      <div>
        <div className="mb-3">
          <h2 className="text-foreground text-sm font-semibold">{t("depositsTitle")}</h2>
          <p className="text-muted text-xs">{t("depositsSubtitle")}</p>
        </div>

        <AdminTableToolbar
          value={depositsSearchInput}
          onChange={handleDepositsSearchChange}
          placeholder={t("depositsSearchPlaceholder")}
          total={deposits?.total}
          totalLabel={(count) => t("depositsCount", { count })}
          filters={
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="border-border bg-surface text-foreground rounded-xl border px-3 py-2 text-xs outline-none"
            >
              {STATUS_FILTERS.map((opt) => (
                <option key={opt.value || "all"} value={opt.value}>
                  {t(opt.labelKey as "allStatuses")}
                </option>
              ))}
            </select>
          }
        />

        <DataTable
          data={deposits?.data ?? []}
          columns={depositColumns}
          isLoading={depositsLoading}
          emptyMessage={t("depositsEmpty")}
          pagination={depositsPagination}
          pageCount={deposits?.pageCount}
          total={deposits?.total}
          onPaginationChange={setDepositsPagination}
        />
      </div>
    </div>
  );
}

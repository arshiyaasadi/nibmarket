"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { Coins, Lock, TrendingDown, TrendingUp } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { AdminOverviewStatCard } from "@/components/molecules/AdminOverviewStatCard";
import { AdminTableToolbar } from "@/components/molecules/AdminTableToolbar";
import { DataTable } from "@/components/ui/DataTable";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { formatDisplayDate } from "@/lib/utils";
import type {
  AdminTwinAllocationRow,
  AdminTwinAllocationsResponse,
  AdminTwinAllocationSource,
  AdminTwinOverviewResponse,
} from "@/types/admin";

export default function TwinPageContent() {
  const t = useTranslations("admin.twin");
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 });
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput);

  function handleSearchChange(value: string) {
    setSearchInput(value);
    setPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 }));
  }

  const { data: overview, isLoading: overviewLoading } = useQuery<AdminTwinOverviewResponse>({
    queryKey: ["admin", "twin", "overview"],
    queryFn: () => apiClient.get(ENDPOINTS.ADMIN.TWIN.OVERVIEW),
  });

  const { data, isLoading } = useQuery<AdminTwinAllocationsResponse>({
    queryKey: ["admin", "twin", "allocations", pagination, search],
    queryFn: () =>
      apiClient.get(
        `${ENDPOINTS.ADMIN.TWIN.ALLOCATIONS}?page=${pagination.pageIndex}&pageSize=${pagination.pageSize}&search=${encodeURIComponent(search)}`,
      ),
  });

  const sourceLabel = (source: AdminTwinAllocationSource) => t(`sources.${source}`);

  const columns: ColumnDef<AdminTwinAllocationRow, unknown>[] = [
    {
      accessorKey: "fullName",
      header: t("columns.name"),
      cell: ({ getValue }) => <span className="font-medium">{String(getValue())}</span>,
    },
    {
      accessorKey: "mobile",
      header: t("columns.mobile"),
      cell: ({ getValue }) => (
        <span dir="ltr" className="text-xs">
          {String(getValue())}
        </span>
      ),
    },
    {
      accessorKey: "totalTokens",
      header: t("columns.totalTokens"),
      cell: ({ getValue }) => (
        <span className="tabular-nums">{Number(getValue()).toLocaleString("fa-IR")}</span>
      ),
    },
    {
      accessorKey: "availableTokens",
      header: t("columns.availableTokens"),
      cell: ({ getValue }) => (
        <span className="tabular-nums">{Number(getValue()).toLocaleString("fa-IR")}</span>
      ),
    },
    {
      accessorKey: "frozenTokens",
      header: t("columns.frozenTokens"),
      cell: ({ getValue }) => (
        <span className="tabular-nums">{Number(getValue()).toLocaleString("fa-IR")}</span>
      ),
    },
    {
      accessorKey: "frozenPercent",
      header: t("columns.frozenPercent"),
      cell: ({ getValue }) => (
        <span className="text-muted tabular-nums">
          {Number(getValue()).toLocaleString("fa-IR")}٪
        </span>
      ),
    },
    {
      accessorKey: "primarySource",
      header: t("columns.source"),
      cell: ({ getValue }) => (
        <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[11px] font-semibold">
          {sourceLabel(getValue() as AdminTwinAllocationSource)}
        </span>
      ),
    },
    {
      accessorKey: "lastAllocationAt",
      header: t("columns.allocatedAt"),
      cell: ({ getValue }) => (
        <span className="text-muted text-xs">{formatDisplayDate(String(getValue()))}</span>
      ),
    },
  ];

  const priceChange = overview?.tokenPriceChangePercent24h ?? 0;
  const priceTrendUp = priceChange >= 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-foreground text-xl font-bold">{t("title")}</h1>
        <p className="text-muted mt-1 text-xs">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {overviewLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="border-border bg-surface h-24 animate-pulse rounded-2xl border"
            />
          ))
        ) : (
          <>
            <AdminOverviewStatCard
              label={t("instantPrice")}
              value={(overview?.tokenPriceRial ?? 0).toLocaleString("fa-IR")}
              unit={t("rialUnit")}
              hint={t("priceChange", { value: Math.abs(priceChange).toLocaleString("fa-IR") })}
              icon={priceTrendUp ? TrendingUp : TrendingDown}
              iconClassName={
                priceTrendUp ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
              }
            />
            <AdminOverviewStatCard
              label={t("totalTokens")}
              value={(overview?.totalTokens ?? 0).toLocaleString("fa-IR")}
              unit={t("tokenUnit")}
              icon={Coins}
              iconClassName="bg-primary/10 text-primary"
            />
            <AdminOverviewStatCard
              label={t("frozenTokens")}
              value={(overview?.totalFrozenTokens ?? 0).toLocaleString("fa-IR")}
              unit={t("tokenUnit")}
              hint={t("frozenPercent", {
                percent: (overview?.frozenPercent ?? 0).toLocaleString("fa-IR"),
              })}
              icon={Lock}
              iconClassName="bg-amber-500/10 text-amber-600"
            />
          </>
        )}
      </div>

      <div>
        <div className="mb-4">
          <h2 className="text-foreground text-sm font-semibold">{t("allocationsTitle")}</h2>
          <p className="text-muted mt-0.5 text-xs">{t("allocationsSubtitle")}</p>
        </div>

        <AdminTableToolbar
          value={searchInput}
          onChange={handleSearchChange}
          placeholder={t("searchPlaceholder")}
          total={data?.total}
          totalLabel={(count) => t("tableCount", { count })}
        />

        <DataTable
          data={data?.data ?? []}
          columns={columns}
          pageCount={data?.pageCount}
          total={data?.total}
          pagination={pagination}
          onPaginationChange={setPagination}
          isLoading={isLoading}
          emptyMessage={t("empty")}
        />
      </div>
    </div>
  );
}

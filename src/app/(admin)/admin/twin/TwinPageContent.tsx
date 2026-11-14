"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { ROUTES } from "@/config/routes";
import { TwinCompositionCard } from "@/components/organisms/admin/twin/TwinCompositionCard";
import { AdminTableToolbar } from "@/components/molecules/AdminTableToolbar";
import { DataTable } from "@/components/ui/DataTable";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { formatDisplayDate } from "@/lib/utils";
import type {
  AdminTwinAllocationRow,
  AdminTwinAllocationsResponse,
  AdminTwinAllocationSource,
  AdminTwinOverviewResponse,
  AdminTwinSourcesResponse,
} from "@/types/admin";

function pn(value: number) {
  return value.toLocaleString("fa-IR");
}

export default function TwinPageContent() {
  const t = useTranslations("admin.twin");
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 });
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput);
  const [sourceFilter, setSourceFilter] = useState("");

  function handleSearchChange(value: string) {
    setSearchInput(value);
    setPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 }));
  }

  function handleSourceFilterChange(value: string) {
    setSourceFilter(value);
    setPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 }));
  }

  const { data: overview, isLoading: overviewLoading } = useQuery<AdminTwinOverviewResponse>({
    queryKey: ["admin", "twin", "overview"],
    queryFn: () => apiClient.get(ENDPOINTS.ADMIN.TWIN.OVERVIEW),
  });

  const { data: sourcesCatalog } = useQuery<AdminTwinSourcesResponse>({
    queryKey: ["admin", "twin", "sources"],
    queryFn: () => apiClient.get(ENDPOINTS.ADMIN.TWIN.SOURCES),
  });

  const { data, isLoading } = useQuery<AdminTwinAllocationsResponse>({
    queryKey: ["admin", "twin", "allocations", pagination, search, sourceFilter],
    queryFn: () =>
      apiClient.get(
        `${ENDPOINTS.ADMIN.TWIN.ALLOCATIONS}?page=${pagination.pageIndex}&pageSize=${pagination.pageSize}&search=${encodeURIComponent(search)}&source=${encodeURIComponent(sourceFilter)}`,
      ),
  });

  const sourceLabelByCode = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of sourcesCatalog?.items ?? []) {
      map.set(item.code, item.label);
    }
    return map;
  }, [sourcesCatalog?.items]);

  const sourceLabel = (source: AdminTwinAllocationSource | string) =>
    sourceLabelByCode.get(source) ??
    (t.has(`sources.${source}` as never) ? t(`sources.${source}` as never) : String(source));

  const barData = useMemo(
    () =>
      (overview?.sourceBreakdown ?? []).map((item) => ({
        source: item.source,
        label: sourceLabel(item.source),
        totalTokens: item.totalTokens,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sourceLabel closes over sourceLabelByCode + t
    [overview?.sourceBreakdown, sourceLabelByCode, t],
  );

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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="border-border bg-surface flex flex-col gap-4 rounded-2xl border p-5 lg:col-span-4">
          {overviewLoading ? (
            <div className="h-28 animate-pulse rounded-xl bg-black/5 dark:bg-white/5" />
          ) : (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-muted text-xs">{t("instantPrice")}</p>
                  <p className="text-foreground mt-1.5 text-2xl font-bold tabular-nums">
                    {pn(overview?.tokenPriceRial ?? 0)}{" "}
                    <span className="text-muted text-sm font-normal">{t("rialUnit")}</span>
                  </p>
                  <p className="text-muted mt-1 flex items-center gap-1 text-[11px]">
                    {priceTrendUp ? (
                      <TrendingUp size={12} className="text-green-600" />
                    ) : (
                      <TrendingDown size={12} className="text-red-600" />
                    )}
                    {t("priceChange", { value: pn(Math.abs(priceChange)) })}
                  </p>
                </div>
              </div>
              <Link
                href={ROUTES.ADMIN.TWIN_PRICE}
                className="border-border text-primary hover:bg-surface-2 inline-flex items-center justify-center rounded-xl border px-3 py-2 text-xs font-medium transition-colors"
              >
                {t("viewMorePrice")}
              </Link>
            </>
          )}
        </div>

        <div className="lg:col-span-8">
          <TwinCompositionCard overview={overview} isLoading={overviewLoading} showTreasuryNav />
        </div>
      </div>

      <section className="border-border bg-surface rounded-2xl border p-5">
        <div className="mb-4">
          <h2 className="text-foreground text-sm font-semibold">{t("sourceChartTitle")}</h2>
          <p className="text-muted mt-0.5 text-xs">{t("sourceChartSubtitle")}</p>
        </div>
        {overviewLoading ? (
          <div className="h-56 animate-pulse rounded-xl bg-black/5 dark:bg-white/5" />
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={50}
                />
                <YAxis tick={{ fontSize: 11 }} width={48} />
                <Tooltip
                  formatter={(value) =>
                    `${pn(typeof value === "number" ? value : Number(value ?? 0))} ${t("tokenUnit")}`
                  }
                />
                <Bar dataKey="totalTokens" fill="#0d9488" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

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
          filters={
            <select
              value={sourceFilter}
              onChange={(e) => handleSourceFilterChange(e.target.value)}
              className="border-border bg-surface text-foreground rounded-xl border px-3 py-2 text-sm outline-none"
            >
              <option value="">{t("allSources")}</option>
              {(sourcesCatalog?.items ?? []).map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label || sourceLabel(item.code)}
                </option>
              ))}
            </select>
          }
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

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { Coins, Package, PackageOpen, TrendingDown, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { ROUTES } from "@/config/routes";
import { Button } from "@/components/atoms/Button";
import { AdminTableToolbar } from "@/components/molecules/AdminTableToolbar";
import { JalaliDatePicker } from "@/components/molecules/JalaliDatePicker";
import { DataTable } from "@/components/ui/DataTable";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { formatDisplayDate } from "@/lib/utils";
import type {
  AdminTwinAllocationRow,
  AdminTwinAllocationsResponse,
  AdminTwinAllocationSource,
  AdminTwinOverviewResponse,
  AdminTwinSourcesResponse,
  AdminTwinSupplyAdjustmentRequest,
  AdminTwinSupplyAdjustmentRow,
  AdminTwinSupplyAdjustmentsResponse,
} from "@/types/admin";

const PIE_COLORS = {
  allocated: "#0d9488",
  frozen: "#d97706",
  unallocated: "#64748b",
};

function pn(value: number) {
  return value.toLocaleString("fa-IR");
}

export default function TwinPageContent() {
  const t = useTranslations("admin.twin");
  const qc = useQueryClient();
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 });
  const [logPagination, setLogPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput);
  const [sourceFilter, setSourceFilter] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [effectiveDate, setEffectiveDate] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

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

  const { data: supplyLog, isLoading: supplyLogLoading } =
    useQuery<AdminTwinSupplyAdjustmentsResponse>({
      queryKey: ["admin", "twin", "supply-adjustments", logPagination],
      queryFn: () =>
        apiClient.get(
          `${ENDPOINTS.ADMIN.TWIN.SUPPLY_ADJUSTMENTS}?page=${logPagination.pageIndex}&pageSize=${logPagination.pageSize}`,
        ),
    });

  const supplyMutation = useMutation({
    mutationFn: (payload: AdminTwinSupplyAdjustmentRequest) =>
      apiClient.post(ENDPOINTS.ADMIN.TWIN.SUPPLY_ADJUSTMENTS, payload),
    onSuccess: () => {
      setAmountInput("");
      setNote("");
      setFormError(null);
      void qc.invalidateQueries({ queryKey: ["admin", "twin"] });
    },
    onError: () => {
      setFormError(t("supplyError"));
    },
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

  const amountNumber = Number(amountInput.replace(/,/g, ""));
  const approxValue =
    Number.isFinite(amountNumber) && overview
      ? Math.round(amountNumber * overview.tokenPriceRial)
      : null;

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

  const logColumns: ColumnDef<AdminTwinSupplyAdjustmentRow, unknown>[] = [
    {
      accessorKey: "effectiveDate",
      header: t("supplyColumns.date"),
      cell: ({ getValue }) => (
        <span className="text-xs tabular-nums" dir="ltr">
          {String(getValue())}
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: t("supplyColumns.amount"),
      cell: ({ getValue }) => {
        const n = Number(getValue());
        return (
          <span className={`tabular-nums ${n < 0 ? "text-red-600" : "text-green-700"}`}>
            {n.toLocaleString("fa-IR")}
          </span>
        );
      },
    },
    {
      accessorKey: "approxValueRial",
      header: t("supplyColumns.value"),
      cell: ({ getValue }) => (
        <span className="tabular-nums">
          {Number(getValue()).toLocaleString("fa-IR")} {t("rialUnit")}
        </span>
      ),
    },
    {
      accessorKey: "createdByName",
      header: t("supplyColumns.admin"),
      cell: ({ getValue }) => <span className="text-sm">{String(getValue())}</span>,
    },
    {
      accessorKey: "note",
      header: t("supplyColumns.note"),
      cell: ({ getValue }) => (
        <span className="text-muted text-xs">{String(getValue() ?? "—")}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: t("supplyColumns.createdAt"),
      cell: ({ getValue }) => (
        <span className="text-muted text-xs">{formatDisplayDate(String(getValue()))}</span>
      ),
    },
  ];

  const priceChange = overview?.tokenPriceChangePercent24h ?? 0;
  const priceTrendUp = priceChange >= 0;

  function submitSupply() {
    setFormError(null);
    if (!Number.isFinite(amountNumber) || amountNumber === 0) {
      setFormError(t("supplyAmountInvalid"));
      return;
    }
    if (!effectiveDate) {
      setFormError(t("supplyDateRequired"));
      return;
    }
    supplyMutation.mutate({
      amount: amountNumber,
      effectiveDate,
      note: note.trim() || undefined,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-foreground text-xl font-bold">{t("title")}</h1>
        <p className="text-muted mt-1 text-xs">{t("subtitle")}</p>
      </div>

      {/* Price + one combined allocation/pie card */}
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

        <div className="border-border bg-surface rounded-2xl border p-5 lg:col-span-8">
          {overviewLoading ? (
            <div className="h-44 animate-pulse rounded-xl bg-black/5 dark:bg-white/5" />
          ) : (
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
                            <p className="text-muted mb-0.5 text-[11px]">
                              {String(item.name ?? "")}
                            </p>
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
          )}
        </div>
      </div>

      {/* Source bar chart */}
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

      {/* Allocations / transactions */}
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

      {/* Supply adjustment form */}
      <section className="border-border bg-surface flex flex-col gap-4 rounded-2xl border p-5">
        <div>
          <h2 className="text-foreground text-sm font-semibold">{t("supplyTitle")}</h2>
          <p className="text-muted mt-0.5 text-xs">{t("supplySubtitle")}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="text-muted mb-1.5 block text-xs">{t("supplyAmount")}</label>
            <input
              type="number"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder={t("supplyAmountPlaceholder")}
              className="border-border bg-surface-2 text-foreground w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
              dir="ltr"
            />
          </div>
          <div>
            <JalaliDatePicker
              label={t("supplyDate")}
              value={effectiveDate}
              onChange={setEffectiveDate}
              placeholder={t("supplyDatePlaceholder")}
            />
          </div>
          <div>
            <label className="text-muted mb-1.5 block text-xs">{t("supplyApprox")}</label>
            <p className="border-border bg-surface-2 text-foreground rounded-xl border px-3 py-2.5 text-sm tabular-nums">
              {approxValue === null ? "—" : `${pn(approxValue)} ${t("rialUnit")}`}
            </p>
          </div>
        </div>

        <div>
          <label className="text-muted mb-1.5 block text-xs">{t("supplyNote")}</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("supplyNotePlaceholder")}
            className="border-border bg-surface-2 text-foreground w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
          />
        </div>

        {formError && <p className="text-xs text-red-600">{formError}</p>}

        <div>
          <Button
            variant="primary"
            size="sm"
            loading={supplyMutation.isPending}
            startIcon={<Coins size={14} />}
            onClick={submitSupply}
          >
            {t("supplySubmit")}
          </Button>
        </div>
      </section>

      {/* Supply log */}
      <div>
        <div className="mb-4">
          <h2 className="text-foreground text-sm font-semibold">{t("supplyLogTitle")}</h2>
          <p className="text-muted mt-0.5 text-xs">{t("supplyLogSubtitle")}</p>
        </div>
        <DataTable
          data={supplyLog?.data ?? []}
          columns={logColumns}
          pageCount={supplyLog?.pageCount}
          total={supplyLog?.total}
          pagination={logPagination}
          onPaginationChange={setLogPagination}
          isLoading={supplyLogLoading}
          emptyMessage={t("supplyLogEmpty")}
        />
      </div>
    </div>
  );
}

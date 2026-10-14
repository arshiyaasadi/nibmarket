"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { ArrowLeftRight, Calendar, Flame, Trophy, TrendingUp, Users, Wallet } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { AdminOverviewStatCard } from "@/components/molecules/AdminOverviewStatCard";
import { AdminTableToolbar } from "@/components/molecules/AdminTableToolbar";
import { DataTable } from "@/components/ui/DataTable";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { jalaliPartsFromDate, JALALI_MONTH_NAMES } from "@/lib/datetime/jalali";
import { cn, formatDate, formatDateRange, formatDateTime } from "@/lib/utils";
import type {
  AdminPoolOverviewResponse,
  AdminPoolParticipantRow,
  AdminPoolParticipantsResponse,
  AdminPoolPeriodRow,
  AdminPoolPeriodsResponse,
  AdminPoolTransactionRow,
  AdminPoolTransactionTypeFilter,
  AdminPoolTransactionsResponse,
} from "@/types/admin";

function timeRemaining(endDateStr: string): { days: number; hours: number; pct: number } {
  const now = new Date();
  const end = new Date(endDateStr);
  if (Number.isNaN(end.getTime())) return { days: 0, hours: 0, pct: 0 };
  const diffMs = end.getTime() - now.getTime();
  if (diffMs <= 0) return { days: 0, hours: 0, pct: 100 };
  const days = Math.floor(diffMs / 86_400_000);
  const hours = Math.floor((diffMs % 86_400_000) / 3_600_000);
  const totalDays = 30;
  const pct = Math.min(100, Math.max(0, ((totalDays - days) / totalDays) * 100));
  return { days, hours, pct };
}

export default function PoolPageContent() {
  const t = useTranslations("admin.pool");
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 });
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput);
  const [periodsPagination, setPeriodsPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [periodsSearchInput, setPeriodsSearchInput] = useState("");
  const periodsSearch = useDebouncedValue(periodsSearchInput);

  const nowJalali = useMemo(() => jalaliPartsFromDate(new Date()), []);
  const [txPagination, setTxPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 });
  const [txSearchInput, setTxSearchInput] = useState("");
  const txSearch = useDebouncedValue(txSearchInput);
  const [txType, setTxType] = useState<AdminPoolTransactionTypeFilter>("");
  const [txYear, setTxYear] = useState<number | "">(nowJalali.year);
  const [txMonth, setTxMonth] = useState<number | "">("");

  function handleSearchChange(value: string) {
    setSearchInput(value);
    setPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 }));
  }

  function handlePeriodsSearchChange(value: string) {
    setPeriodsSearchInput(value);
    setPeriodsPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 }));
  }

  function handleTxSearchChange(value: string) {
    setTxSearchInput(value);
    setTxPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 }));
  }

  function resetTxPage() {
    setTxPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 }));
  }

  const { data: overview, isLoading: overviewLoading } = useQuery<AdminPoolOverviewResponse>({
    queryKey: ["admin", "pool", "overview"],
    queryFn: () => apiClient.get(ENDPOINTS.ADMIN.POOL.OVERVIEW),
  });

  const { data, isLoading } = useQuery<AdminPoolParticipantsResponse>({
    queryKey: ["admin", "pool", "participants", pagination, search],
    queryFn: () =>
      apiClient.get(
        `${ENDPOINTS.ADMIN.POOL.PARTICIPANTS}?page=${pagination.pageIndex}&pageSize=${pagination.pageSize}&search=${encodeURIComponent(search)}`,
      ),
  });

  const { data: periodsData, isLoading: periodsLoading } = useQuery<AdminPoolPeriodsResponse>({
    queryKey: ["admin", "pool", "periods", periodsPagination, periodsSearch],
    queryFn: () =>
      apiClient.get(
        `${ENDPOINTS.ADMIN.POOL.PERIODS}?page=${periodsPagination.pageIndex}&pageSize=${periodsPagination.pageSize}&search=${encodeURIComponent(periodsSearch)}`,
      ),
  });

  const txQuery = useMemo(() => {
    const params = new URLSearchParams({
      page: String(txPagination.pageIndex),
      pageSize: String(txPagination.pageSize),
      search: txSearch,
    });
    if (txType) params.set("type", txType);
    if (txYear !== "") params.set("year", String(txYear));
    if (txMonth !== "") params.set("month", String(txMonth));
    return params.toString();
  }, [txPagination, txSearch, txType, txYear, txMonth]);

  const { data: txData, isLoading: txLoading } = useQuery<AdminPoolTransactionsResponse>({
    queryKey: ["admin", "pool", "transactions", txQuery],
    queryFn: () => apiClient.get(`${ENDPOINTS.ADMIN.POOL.TRANSACTIONS}?${txQuery}`),
  });

  const yearOptions = useMemo(() => {
    const y = nowJalali.year;
    return [y, y - 1, y - 2];
  }, [nowJalali.year]);

  const remaining = useMemo(
    () => (overview ? timeRemaining(overview.endDate) : { days: 0, hours: 0, pct: 0 }),
    [overview],
  );

  const periodTitle = overview?.contextTitle
    ? t(`periods.${overview.contextTitle}` as "periods.current")
    : "—";

  const participantColumns = useMemo<ColumnDef<AdminPoolParticipantRow, unknown>[]>(
    () => [
      {
        accessorKey: "rank",
        header: t("columns.rank"),
        cell: ({ getValue }) => (
          <span className="text-primary font-semibold tabular-nums">
            #{Number(getValue()).toLocaleString("fa-IR")}
          </span>
        ),
      },
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
        accessorKey: "subsetCount",
        header: t("columns.subsetCount"),
        cell: ({ getValue }) => (
          <span className="tabular-nums">{Number(getValue()).toLocaleString("fa-IR")}</span>
        ),
      },
      {
        accessorKey: "tokens",
        header: t("columns.tokens"),
        cell: ({ getValue }) => (
          <span className="tabular-nums">{Number(getValue()).toLocaleString("fa-IR")}</span>
        ),
      },
      {
        accessorKey: "sharePercent",
        header: t("columns.sharePercent"),
        cell: ({ getValue }) => (
          <span className="text-muted tabular-nums">
            {Number(getValue()).toLocaleString("fa-IR")}٪
          </span>
        ),
      },
      {
        accessorKey: "estimatedReward",
        header: t("columns.estimatedReward"),
        cell: ({ getValue }) => (
          <span className="tabular-nums">{Number(getValue()).toLocaleString("fa-IR")}</span>
        ),
      },
    ],
    [t],
  );

  const txColumns = useMemo<ColumnDef<AdminPoolTransactionRow, unknown>[]>(
    () => [
      {
        accessorKey: "status",
        header: t("txColumns.status"),
        cell: ({ getValue }) => {
          const status = String(getValue()) as AdminPoolTransactionRow["status"];
          return (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                status === "deposited" &&
                  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
                status === "burned" && "bg-red-500/15 text-red-700 dark:text-red-300",
                status === "allocated" && "bg-amber-500/15 text-amber-700 dark:text-amber-300",
              )}
            >
              {t(`txStatus.${status}`)}
            </span>
          );
        },
      },
      {
        accessorKey: "amount",
        header: t("txColumns.amount"),
        cell: ({ getValue }) => (
          <span className="tabular-nums">{Number(getValue()).toLocaleString("fa-IR")}</span>
        ),
      },
      {
        id: "user",
        header: t("txColumns.user"),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.userName}</span>
            <span className="text-muted text-xs" dir="ltr">
              {row.original.userMobile}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "periodTitle",
        header: t("txColumns.period"),
        cell: ({ getValue }) => <span className="text-sm">{String(getValue())}</span>,
      },
      {
        accessorKey: "description",
        header: t("txColumns.description"),
        cell: ({ getValue }) => (
          <span className="text-muted line-clamp-2 text-xs">{String(getValue())}</span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: t("txColumns.date"),
        cell: ({ getValue }) => (
          <span className="text-muted text-xs tabular-nums">
            {formatDateTime(String(getValue()))}
          </span>
        ),
      },
    ],
    [t],
  );

  const historyColumns = useMemo<ColumnDef<AdminPoolPeriodRow, unknown>[]>(
    () => [
      {
        accessorKey: "title",
        header: t("historyColumns.title"),
        cell: ({ getValue }) => <span className="font-medium">{String(getValue())}</span>,
      },
      {
        id: "range",
        header: t("historyColumns.range"),
        cell: ({ row }) => (
          <span className="text-muted text-xs">
            {formatDateRange(row.original.startDate, row.original.endDate)}
          </span>
        ),
      },
      {
        accessorKey: "totalPool",
        header: t("historyColumns.totalPool"),
        cell: ({ getValue }) => (
          <span className="tabular-nums">{Number(getValue()).toLocaleString("fa-IR")}</span>
        ),
      },
      {
        accessorKey: "participantCount",
        header: t("historyColumns.participants"),
        cell: ({ getValue }) => (
          <span className="tabular-nums">{Number(getValue()).toLocaleString("fa-IR")}</span>
        ),
      },
      {
        accessorKey: "winnerName",
        header: t("historyColumns.winner"),
        cell: ({ getValue }) => <span>{String(getValue())}</span>,
      },
      {
        accessorKey: "distributedAmount",
        header: t("historyColumns.distributed"),
        cell: ({ getValue }) => (
          <span className="tabular-nums">{Number(getValue()).toLocaleString("fa-IR")}</span>
        ),
      },
    ],
    [t],
  );

  const changePositive = (overview?.dailyChange ?? 0) >= 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-foreground text-xl font-bold">{t("title")}</h1>
        <p className="text-muted mt-1 text-xs">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
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
              label={t("totalPool")}
              value={(overview?.totalPool ?? 0).toLocaleString("fa-IR")}
              unit={t("twinUnit")}
              icon={Wallet}
              iconClassName="bg-primary/10 text-primary"
            />
            <AdminOverviewStatCard
              label={t("dailyChange")}
              value={`${changePositive ? "+" : "-"}${Math.abs(overview?.dailyChange ?? 0).toLocaleString("fa-IR")}`}
              unit={t("twinUnit")}
              hint={t("dailyChangePercent", {
                percent: (overview?.dailyChangePercent ?? 0).toLocaleString("fa-IR"),
              })}
              icon={TrendingUp}
              iconClassName={
                changePositive ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
              }
            />
            <AdminOverviewStatCard
              label={t("participants")}
              value={(overview?.participantCount ?? 0).toLocaleString("fa-IR")}
              icon={Users}
              iconClassName="bg-blue-500/10 text-blue-600"
            />
            <AdminOverviewStatCard
              label={t("topWinners")}
              value={(overview?.topWinners ?? 0).toLocaleString("fa-IR")}
              hint={t("topWinnersHint", { count: overview?.topWinners ?? 0 })}
              icon={Trophy}
              iconClassName="bg-amber-500/10 text-amber-600"
            />
          </>
        )}
      </div>

      {overview && !overviewLoading && (
        <div className="border-border bg-surface grid grid-cols-1 gap-4 rounded-2xl border p-5 lg:grid-cols-3">
          <div>
            <p className="text-muted text-xs">{t("currentPeriod")}</p>
            <p className="text-foreground mt-1 text-sm font-semibold">{periodTitle}</p>
            <p className="text-muted mt-1 text-xs">
              {t("periodRange", {
                start: formatDate(overview.startDate),
                end: formatDate(overview.endDate),
              })}
            </p>
          </div>
          <div>
            <p className="text-muted text-xs">{t("timeRemaining")}</p>
            <p className="text-foreground mt-1 text-sm font-semibold">
              {t("daysHours", {
                days: remaining.days.toLocaleString("fa-IR"),
                hours: remaining.hours.toLocaleString("fa-IR"),
              })}
            </p>
            <div className="bg-border mt-2 h-1.5 overflow-hidden rounded-full">
              <div
                className="bg-primary h-full rounded-full transition-all"
                style={{ width: `${remaining.pct}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="border-border rounded-xl border p-3">
              <p className="text-muted text-[11px]">{t("distributed")}</p>
              <p className="text-foreground mt-1 text-sm font-semibold tabular-nums">
                {overview.distributedThisPeriod.toLocaleString("fa-IR")}
              </p>
            </div>
            <div className="border-border rounded-xl border p-3">
              <p className="text-muted text-[11px]">{t("pending")}</p>
              <p className="text-foreground mt-1 text-sm font-semibold tabular-nums">
                {overview.pendingDistribution.toLocaleString("fa-IR")}
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="mb-4">
          <h2 className="text-foreground text-sm font-semibold">{t("participantsTitle")}</h2>
          <p className="text-muted mt-0.5 text-xs">{t("participantsSubtitle")}</p>
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
          columns={participantColumns}
          pageCount={data?.pageCount}
          total={data?.total}
          pagination={pagination}
          onPaginationChange={setPagination}
          isLoading={isLoading}
          emptyMessage={t("empty")}
        />
      </div>

      <div>
        <div className="mb-4 flex items-center gap-2">
          <ArrowLeftRight size={18} className="text-primary" />
          <div>
            <h2 className="text-foreground text-sm font-semibold">{t("transactionsTitle")}</h2>
            <p className="text-muted mt-0.5 text-xs">{t("transactionsSubtitle")}</p>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <AdminOverviewStatCard
            label={t("txSummaryInflow")}
            value={(txData?.summary.totalInflow ?? 0).toLocaleString("fa-IR")}
            unit={t("twinUnit")}
            icon={Wallet}
            iconClassName="bg-emerald-500/10 text-emerald-600"
          />
          <AdminOverviewStatCard
            label={t("txSummaryBurned")}
            value={(txData?.summary.totalBurned ?? 0).toLocaleString("fa-IR")}
            unit={t("twinUnit")}
            icon={Flame}
            iconClassName="bg-red-500/10 text-red-600"
          />
          <AdminOverviewStatCard
            label={t("txSummaryAllocated")}
            value={(txData?.summary.totalAllocated ?? 0).toLocaleString("fa-IR")}
            unit={t("twinUnit")}
            icon={Trophy}
            iconClassName="bg-amber-500/10 text-amber-600"
          />
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <select
            className="border-border bg-background h-9 rounded-lg border px-2 text-sm"
            value={txType}
            aria-label={t("txFilterType")}
            onChange={(e) => {
              setTxType(e.target.value as AdminPoolTransactionTypeFilter);
              resetTxPage();
            }}
          >
            <option value="">{t("txFilterTypeAll")}</option>
            <option value="inflow">{t("txFilterTypeInflow")}</option>
            <option value="burn">{t("txFilterTypeBurn")}</option>
            <option value="payout">{t("txFilterTypePayout")}</option>
          </select>
          <select
            className="border-border bg-background h-9 rounded-lg border px-2 text-sm"
            value={txYear === "" ? "" : String(txYear)}
            aria-label={t("txFilterYear")}
            onChange={(e) => {
              setTxYear(e.target.value ? Number(e.target.value) : "");
              resetTxPage();
            }}
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y.toLocaleString("fa-IR")}
              </option>
            ))}
          </select>
          <select
            className="border-border bg-background h-9 rounded-lg border px-2 text-sm"
            value={txMonth === "" ? "" : String(txMonth)}
            aria-label={t("txFilterMonth")}
            onChange={(e) => {
              setTxMonth(e.target.value ? Number(e.target.value) : "");
              resetTxPage();
            }}
          >
            <option value="">{t("txFilterMonthAll")}</option>
            {JALALI_MONTH_NAMES.map((name, i) => (
              <option key={name} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <AdminTableToolbar
          value={txSearchInput}
          onChange={handleTxSearchChange}
          placeholder={t("transactionsSearchPlaceholder")}
          total={txData?.total}
          totalLabel={(count) => t("transactionsCount", { count })}
        />

        <DataTable
          data={txData?.data ?? []}
          columns={txColumns}
          pageCount={txData?.pageCount}
          total={txData?.total}
          pagination={txPagination}
          onPaginationChange={setTxPagination}
          isLoading={txLoading}
          emptyMessage={t("transactionsEmpty")}
        />
      </div>

      <div>
        <div className="mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-primary" />
          <div>
            <h2 className="text-foreground text-sm font-semibold">{t("historyTitle")}</h2>
            <p className="text-muted mt-0.5 text-xs">{t("historySubtitle")}</p>
          </div>
        </div>

        <AdminTableToolbar
          value={periodsSearchInput}
          onChange={handlePeriodsSearchChange}
          placeholder={t("historySearchPlaceholder")}
          total={periodsData?.total}
          totalLabel={(count) => t("historyCount", { count })}
        />

        <DataTable
          data={periodsData?.data ?? []}
          columns={historyColumns}
          pageCount={periodsData?.pageCount}
          total={periodsData?.total}
          pagination={periodsPagination}
          onPaginationChange={setPeriodsPagination}
          isLoading={periodsLoading}
          emptyMessage={t("historyEmpty")}
        />
      </div>
    </div>
  );
}

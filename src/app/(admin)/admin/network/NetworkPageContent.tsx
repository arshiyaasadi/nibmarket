"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { Mail, UserPlus } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { DataTable } from "@/components/ui/DataTable";
import { AdminOverviewStatCard } from "@/components/molecules/AdminOverviewStatCard";
import { AdminTableToolbar } from "@/components/molecules/AdminTableToolbar";
import { InviteTemplateList } from "@/components/organisms/admin/network/InviteTemplateList";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type {
  AdminInviteLogResponse,
  AdminInviteLogRow,
  AdminInviteOverviewResponse,
  AdminInviteTemplatesResponse,
} from "@/types/admin";

const LOG_STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500/10 text-green-600",
  pending_invite: "bg-yellow-500/10 text-yellow-700",
  pending_verification: "bg-yellow-500/10 text-yellow-700",
  suspended: "bg-red-500/10 text-red-600",
  closed: "bg-gray-500/10 text-gray-500",
};

function formatLogTime(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString("fa-IR")} · ${d.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}`;
}

export default function NetworkPageContent() {
  const t = useTranslations("admin.network");
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput);

  function handleSearchChange(value: string) {
    setSearchInput(value);
    setPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 }));
  }

  const { data: overview, isLoading: overviewLoading } = useQuery<AdminInviteOverviewResponse>({
    queryKey: ["admin", "network", "invites", "overview"],
    queryFn: () => apiClient.get(ENDPOINTS.ADMIN.NETWORK.INVITES_OVERVIEW),
  });

  const { data: templates, isLoading: templatesLoading } = useQuery<AdminInviteTemplatesResponse>({
    queryKey: ["admin", "network", "invite-templates"],
    queryFn: () => apiClient.get(ENDPOINTS.ADMIN.NETWORK.INVITE_TEMPLATES),
  });

  const { data: logs, isLoading: logsLoading } = useQuery<AdminInviteLogResponse>({
    queryKey: ["admin", "network", "invites", "log", pagination, search],
    queryFn: () =>
      apiClient.get(
        `${ENDPOINTS.ADMIN.NETWORK.INVITES_LOG}?page=${pagination.pageIndex}&pageSize=${pagination.pageSize}&search=${encodeURIComponent(search)}`,
      ),
  });

  const logColumns = useMemo<ColumnDef<AdminInviteLogRow, unknown>[]>(
    () => [
      {
        accessorKey: "sentAt",
        header: t("logColumns.sentAt"),
        cell: ({ getValue }) => (
          <span className="text-muted text-xs tabular-nums">
            {formatLogTime(String(getValue()))}
          </span>
        ),
      },
      {
        accessorKey: "inviterName",
        header: t("logColumns.inviter"),
        cell: ({ row }) => <span className="text-sm font-medium">{row.original.inviterName}</span>,
      },
      {
        accessorKey: "inviterMobile",
        header: t("logColumns.inviterMobile"),
        cell: ({ getValue }) => (
          <span className="text-muted text-xs" dir="ltr">
            {String(getValue())}
          </span>
        ),
      },
      {
        accessorKey: "inviteeMobile",
        header: t("logColumns.inviteeMobile"),
        cell: ({ getValue }) => (
          <span className="text-foreground text-sm font-medium" dir="ltr">
            {String(getValue())}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: t("logColumns.status"),
        cell: ({ getValue }) => {
          const status = String(getValue());
          return (
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${LOG_STATUS_COLORS[status] ?? ""}`}
            >
              {t(`status.${status}` as "status.active")}
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
              label={t("todayInvites")}
              value={(overview?.todayCount ?? 0).toLocaleString("fa-IR")}
              icon={Mail}
              iconClassName="bg-green-500/10 text-green-600"
            />
            <AdminOverviewStatCard
              label={t("totalInvites")}
              value={(overview?.totalCount ?? 0).toLocaleString("fa-IR")}
              icon={UserPlus}
              iconClassName="bg-primary/10 text-primary"
            />
          </>
        )}
      </div>

      <section>
        <h2 className="text-foreground mb-2 text-sm font-semibold">{t("templatesTitle")}</h2>
        <InviteTemplateList templates={templates?.data ?? []} isLoading={templatesLoading} />
      </section>

      <section>
        <div className="mb-3">
          <h2 className="text-foreground text-sm font-semibold">{t("logTitle")}</h2>
        </div>

        <AdminTableToolbar
          value={searchInput}
          onChange={handleSearchChange}
          placeholder={t("searchPlaceholder")}
          total={logs?.total}
          totalLabel={(count) => t("logCount", { count })}
        />

        <DataTable
          data={logs?.data ?? []}
          columns={logColumns}
          isLoading={logsLoading}
          emptyMessage={t("logEmpty")}
          pagination={pagination}
          pageCount={logs?.pageCount}
          total={logs?.total}
          onPaginationChange={setPagination}
        />
      </section>
    </div>
  );
}

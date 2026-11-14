"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { RefreshCw } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { Button } from "@/components/atoms/Button";
import { Alert } from "@/components/atoms/Alert";
import { DataTable } from "@/components/ui/DataTable";
import { AdminTableToolbar } from "@/components/molecules/AdminTableToolbar";
import { AdminUserKycSummaryCard } from "@/components/organisms/admin/users/AdminUserKycSummaryCard";
import { ChangeUserStatusModal } from "@/components/organisms/admin/users/ChangeUserStatusModal";
import { UserRowActions } from "@/components/organisms/admin/users/UserRowActions";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { formatDisplayDate } from "@/lib/utils";
import { ApiException } from "@/types/api";
import type {
  AdminUserKycStatus,
  AdminUserListItem,
  AdminUsersKycSummaryResponse,
  AdminUsersListResponse,
  AdminUsersSyncResponse,
  AdminUserStatus,
  UpdateAdminUserStatusRequest,
} from "@/types/admin";

const STATUS_OPTIONS: AdminUserStatus[] = ["active", "suspended", "pending_verification", "closed"];

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500/10 text-green-600",
  suspended: "bg-red-500/10 text-red-600",
  pending_verification: "bg-yellow-500/10 text-yellow-600",
  closed: "bg-gray-500/10 text-gray-500",
};

export default function UsersPageContent() {
  const t = useTranslations("admin.users");
  const qc = useQueryClient();
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 });
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput);
  const [statusFilter, setStatusFilter] = useState("");
  const [sejamFilter, setSejamFilter] = useState<"" | "true" | "false">("");
  const [statusModalUser, setStatusModalUser] = useState<AdminUserListItem | null>(null);
  const [syncMessage, setSyncMessage] = useState<{
    variant: "success" | "danger";
    text: string;
  } | null>(null);

  function handleSearchChange(value: string) {
    setSearchInput(value);
    setPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 }));
  }

  function handleStatusFilterChange(value: string) {
    setStatusFilter(value);
    setPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 }));
  }

  function handleSejamFilterChange(value: string) {
    setSejamFilter(value === "true" || value === "false" ? value : "");
    setPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 }));
  }

  const { data: kycSummary, isLoading: kycSummaryLoading } = useQuery<AdminUsersKycSummaryResponse>(
    {
      queryKey: ["admin", "users", "kyc-summary"],
      queryFn: () => apiClient.get(ENDPOINTS.ADMIN.USERS.KYC_SUMMARY),
    },
  );

  const { data, isLoading } = useQuery<AdminUsersListResponse>({
    queryKey: ["admin", "users", pagination, search, statusFilter, sejamFilter],
    queryFn: () =>
      apiClient.get(
        `${ENDPOINTS.ADMIN.USERS.LIST}?page=${pagination.pageIndex}&pageSize=${pagination.pageSize}&search=${encodeURIComponent(search)}&status=${statusFilter}&hasSejamIdentity=${sejamFilter}`,
      ),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AdminUserStatus }) =>
      apiClient.patch(ENDPOINTS.ADMIN.USERS.UPDATE_STATUS(id), {
        status,
      } satisfies UpdateAdminUserStatusRequest),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      setStatusModalUser(null);
    },
  });

  const syncMutation = useMutation({
    mutationFn: () => apiClient.post<AdminUsersSyncResponse>(ENDPOINTS.ADMIN.USERS.SYNC, {}),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      const count = typeof result?.syncedCount === "number" ? ` (${result.syncedCount})` : "";
      setSyncMessage({
        variant: "success",
        text: `${t("syncUsersSuccess")}${count}`,
      });
    },
    onError: (error) => {
      const message =
        error instanceof ApiException && error.message ? error.message : t("syncUsersError");
      setSyncMessage({ variant: "danger", text: message });
    },
  });

  const columns = useMemo<ColumnDef<AdminUserListItem, unknown>[]>(
    () => [
      {
        accessorKey: "fullName",
        header: t("columns.name"),
        cell: ({ row }) => <span className="font-medium">{row.original.fullName || "—"}</span>,
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
        accessorKey: "email",
        header: t("columns.email"),
        cell: ({ getValue }) => (
          <span dir="ltr" className="text-xs">
            {String(getValue() ?? "—")}
          </span>
        ),
      },
      {
        accessorKey: "role",
        header: t("columns.role"),
        cell: ({ getValue }) => {
          const r = String(getValue());
          return (
            <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[11px] font-semibold">
              {r}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: t("columns.status"),
        cell: ({ getValue }) => {
          const s = String(getValue()) as AdminUserStatus;
          return (
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_COLORS[s] ?? "bg-gray-100 text-gray-500"}`}
            >
              {t(`status.${s}`)}
            </span>
          );
        },
      },
      {
        accessorKey: "kycStatus",
        header: t("columns.kyc"),
        cell: ({ getValue }) => {
          const kyc = String(getValue()) as AdminUserKycStatus;
          return <span className="text-muted text-xs">{t(`kyc.${kyc}`)}</span>;
        },
      },
      {
        id: "hasSejamIdentity",
        accessorFn: (row) => row.hasSejamIdentity === true,
        header: t("columns.sejam"),
        cell: ({ row }) => {
          const verified = row.original.hasSejamIdentity === true;
          return (
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                verified ? "bg-green-500/10 text-green-700" : "bg-amber-500/10 text-amber-700"
              }`}
            >
              {verified ? t("sejam.yes") : t("sejam.no")}
            </span>
          );
        },
      },
      {
        accessorKey: "referralCode",
        header: t("columns.referralCode"),
        cell: ({ getValue }) => (
          <span dir="ltr" className="font-mono text-xs">
            {String(getValue())}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: t("columns.joinedAt"),
        cell: ({ getValue }) => (
          <span className="text-muted text-xs">{formatDisplayDate(String(getValue()))}</span>
        ),
      },
      {
        id: "actions",
        header: t("columns.actions"),
        cell: ({ row }) => (
          <UserRowActions user={row.original} onChangeStatus={setStatusModalUser} />
        ),
      },
    ],
    [t],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-foreground text-xl font-bold">{t("title")}</h1>
          <p className="text-muted mt-1 text-xs">{t("subtitle")}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          loading={syncMutation.isPending}
          startIcon={<RefreshCw size={14} />}
          onClick={() => {
            setSyncMessage(null);
            syncMutation.mutate();
          }}
        >
          {syncMutation.isPending ? t("syncUsersPending") : t("syncUsers")}
        </Button>
      </div>

      {syncMessage && (
        <Alert variant={syncMessage.variant} onClose={() => setSyncMessage(null)}>
          {syncMessage.text}
        </Alert>
      )}

      <AdminUserKycSummaryCard
        totalUsers={kycSummary?.totalUsers}
        verifiedCount={kycSummary?.verifiedCount}
        unverifiedCount={kycSummary?.unverifiedCount}
        isLoading={kycSummaryLoading}
      />

      <AdminTableToolbar
        value={searchInput}
        onChange={handleSearchChange}
        placeholder={t("searchPlaceholder")}
        total={data?.total}
        totalLabel={(count) => t("tableUserCount", { count })}
        filters={
          <>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="border-border bg-surface text-foreground rounded-xl border px-3 py-2 text-sm outline-none"
            >
              <option value="">{t("allStatuses")}</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {t(`status.${status}`)}
                </option>
              ))}
            </select>
            <select
              value={sejamFilter}
              onChange={(e) => handleSejamFilterChange(e.target.value)}
              className="border-border bg-surface text-foreground rounded-xl border px-3 py-2 text-sm outline-none"
            >
              <option value="">{t("sejam.all")}</option>
              <option value="true">{t("sejam.verified")}</option>
              <option value="false">{t("sejam.unverified")}</option>
            </select>
          </>
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

      <ChangeUserStatusModal
        user={statusModalUser}
        open={Boolean(statusModalUser)}
        loading={statusMutation.isPending}
        onClose={() => setStatusModalUser(null)}
        onSubmit={({ status }) => {
          if (!statusModalUser) return;
          statusMutation.mutate({ id: statusModalUser.id, status });
        }}
      />
    </div>
  );
}

"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { apiClient } from "@/lib/api/client";
import { DataTable } from "@/components/ui/DataTable";
import { Search } from "lucide-react";

interface UserRow {
  id: string;
  mobile: string;
  email: string | null;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  kycStatus: string;
  referralCode: string;
  createdAt: string;
}

interface UsersResponse {
  data: UserRow[];
  total: number;
  pageCount: number;
}

const STATUS_LABELS: Record<string, string> = {
  active: "فعال",
  suspended: "تعلیق",
  pending_verification: "در انتظار تأیید",
  closed: "بسته",
};
const KYC_LABELS: Record<string, string> = {
  none: "—",
  pending: "در انتظار",
  verified: "تأیید شده",
  rejected: "رد شده",
};
const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500/10 text-green-600",
  suspended: "bg-red-500/10 text-red-600",
  pending_verification: "bg-yellow-500/10 text-yellow-600",
  closed: "bg-gray-500/10 text-gray-500",
};

export default function UsersPageContent() {
  const qc = useQueryClient();
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading } = useQuery<UsersResponse>({
    queryKey: ["admin", "users", pagination, search, statusFilter],
    queryFn: () =>
      apiClient.get(`/admin/users?page=${pagination.pageIndex}&pageSize=${pagination.pageSize}&search=${encodeURIComponent(search)}&status=${statusFilter}`),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient.patch(`/admin/users/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });

  const columns: ColumnDef<UserRow, unknown>[] = [
    {
      accessorKey: "fullName",
      header: "نام",
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.firstName || row.original.lastName
            ? `${row.original.firstName} ${row.original.lastName}`.trim()
            : "—"}
        </span>
      ),
    },
    {
      accessorKey: "mobile",
      header: "موبایل",
      cell: ({ getValue }) => <span dir="ltr" className="text-xs">{String(getValue())}</span>,
    },
    {
      accessorKey: "email",
      header: "ایمیل",
      cell: ({ getValue }) => <span dir="ltr" className="text-xs">{String(getValue() ?? "—")}</span>,
    },
    {
      accessorKey: "role",
      header: "نقش",
      cell: ({ getValue }) => {
        const r = String(getValue());
        return <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">{r}</span>;
      },
    },
    {
      accessorKey: "status",
      header: "وضعیت",
      cell: ({ getValue }) => {
        const s = String(getValue());
        return (
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_COLORS[s] ?? "bg-gray-100 text-gray-500"}`}>
            {STATUS_LABELS[s] ?? s}
          </span>
        );
      },
    },
    {
      accessorKey: "kycStatus",
      header: "KYC",
      cell: ({ getValue }) => <span className="text-xs text-muted">{KYC_LABELS[String(getValue())] ?? String(getValue())}</span>,
    },
    {
      accessorKey: "referralCode",
      header: "کد معرف",
      cell: ({ getValue }) => <span dir="ltr" className="font-mono text-xs">{String(getValue())}</span>,
    },
    {
      accessorKey: "createdAt",
      header: "تاریخ عضویت",
      cell: ({ getValue }) => {
        const d = new Date(String(getValue()));
        return <span className="text-xs text-muted">{d.toLocaleDateString("fa-IR")}</span>;
      },
    },
    {
      id: "actions",
      header: "عملیات",
      cell: ({ row }) => {
        const isActive = row.original.status === "active";
        return (
          <button
            onClick={() => statusMutation.mutate({ id: row.original.id, status: isActive ? "suspended" : "active" })}
            className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
              isActive ? "bg-red-500/10 text-red-600 hover:bg-red-500/20" : "bg-green-500/10 text-green-600 hover:bg-green-500/20"
            }`}
          >
            {isActive ? "تعلیق" : "فعال‌سازی"}
          </button>
        );
      },
    },
  ];

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPagination(p => ({ ...p, pageIndex: 0 }));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">کاربران</h1>
        <p className="mt-1 text-xs text-muted">مدیریت کاربران سیستم</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="relative min-w-48 flex-1">
          <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="جستجو موبایل، نام..."
            className="w-full rounded-xl border border-border bg-surface py-2 ps-9 pe-4 text-sm text-foreground outline-none focus:border-primary"
          />
        </form>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPagination(p => ({ ...p, pageIndex: 0 })); }}
          className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none"
        >
          <option value="">همه وضعیت‌ها</option>
          <option value="active">فعال</option>
          <option value="suspended">تعلیق</option>
          <option value="pending_verification">در انتظار تأیید</option>
          <option value="closed">بسته</option>
        </select>
        <span className="text-xs text-muted">{data?.total?.toLocaleString("fa-IR") ?? "—"} کاربر</span>
      </div>

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        pageCount={data?.pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
        emptyMessage="کاربری یافت نشد"
      />
    </div>
  );
}

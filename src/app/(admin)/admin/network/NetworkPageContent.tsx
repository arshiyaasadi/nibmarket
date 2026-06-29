"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { apiClient } from "@/lib/api/client";
import { DataTable } from "@/components/ui/DataTable";
import { Search } from "lucide-react";

interface ClosureRow {
  ancestorId: string;
  ancestorName: string;
  ancestorCode: string;
  descendantId: string;
  descendantName: string;
  descendantCode: string;
  depth: number;
}

interface ClosureResponse {
  data: ClosureRow[];
  total: number;
  pageCount: number;
}

export default function NetworkPageContent() {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 50 });
  const [userIdInput, setUserIdInput] = useState("");
  const [userId, setUserId] = useState("");
  const [depthFilter, setDepthFilter] = useState("");

  const { data, isLoading } = useQuery<ClosureResponse>({
    queryKey: ["admin", "network", pagination, userId, depthFilter],
    queryFn: () =>
      apiClient.get(`/admin/network/closure?page=${pagination.pageIndex}&pageSize=${pagination.pageSize}&userId=${userId}&depth=${depthFilter}`),
  });

  const columns: ColumnDef<ClosureRow, unknown>[] = [
    {
      id: "ancestor",
      header: "نیاکان (Ancestor)",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-foreground">{row.original.ancestorName}</p>
          <p className="text-[11px] text-muted" dir="ltr">{row.original.ancestorCode}</p>
        </div>
      ),
    },
    {
      id: "descendant",
      header: "فرزند (Descendant)",
      cell: ({ row }) => (
        <div style={{ paddingInlineStart: `${row.original.depth * 16}px` }}>
          <p className="font-medium text-foreground">{row.original.descendantName}</p>
          <p className="text-[11px] text-muted" dir="ltr">{row.original.descendantCode}</p>
        </div>
      ),
    },
    {
      accessorKey: "depth",
      header: "عمق",
      cell: ({ getValue }) => (
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
          سطح {Number(getValue()).toLocaleString("fa-IR")}
        </span>
      ),
    },
  ];

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setUserId(userIdInput);
    setPagination(p => ({ ...p, pageIndex: 0 }));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">شبکه (Network Closure)</h1>
        <p className="mt-1 text-xs text-muted">نمایش روابط سلسله‌مراتبی بین کاربران</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="relative min-w-64 flex-1">
          <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={userIdInput}
            onChange={e => setUserIdInput(e.target.value)}
            placeholder="User ID برای فیلتر ancestor..."
            className="w-full rounded-xl border border-border bg-surface py-2 ps-9 pe-4 text-sm text-foreground outline-none focus:border-primary"
            dir="ltr"
          />
        </form>
        <select
          value={depthFilter}
          onChange={e => { setDepthFilter(e.target.value); setPagination(p => ({ ...p, pageIndex: 0 })); }}
          className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none"
        >
          <option value="">همه سطوح</option>
          {[0, 1, 2, 3, 4, 5].map(d => (
            <option key={d} value={d}>سطح {d.toLocaleString("fa-IR")}</option>
          ))}
        </select>
        <span className="text-xs text-muted">{data?.total?.toLocaleString("fa-IR") ?? "—"} رابطه</span>
      </div>

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        pageCount={data?.pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
        emptyMessage="رابطه‌ای یافت نشد"
      />
    </div>
  );
}

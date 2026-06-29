"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { apiClient } from "@/lib/api/client";
import { DataTable } from "@/components/ui/DataTable";
import { UserPlus, Trash2 } from "lucide-react";

interface AdminUser {
  userId: string;
  mobile: string;
  email: string | null;
  fullName: string;
  role: string;
  roleName: string;
  grantedAt: string;
}

export default function AdminsPageContent() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [mobileInput, setMobileInput] = useState("");
  const [roleCode, setRoleCode] = useState("manager");
  const [error, setError] = useState("");
  const [foundUserId, setFoundUserId] = useState("");
  const [searching, setSearching] = useState(false);

  const { data: admins = [], isLoading } = useQuery<AdminUser[]>({
    queryKey: ["admin", "admins"],
    queryFn: () => apiClient.get("/admin/admins/list"),
  });

  async function searchUser() {
    setSearching(true);
    setError("");
    setFoundUserId("");
    try {
      // Search via admin/users
      const res = await apiClient.get<{ data: { id: string; mobile: string }[] }>(`/admin/users?search=${encodeURIComponent(mobileInput)}&pageSize=5`);
      const found = res.data.find((u: { id: string; mobile: string }) => u.mobile === mobileInput);
      if (found) setFoundUserId(found.id);
      else setError("کاربری با این موبایل یافت نشد");
    } catch { setError("خطا در جستجو"); }
    setSearching(false);
  }

  const assignMutation = useMutation({
    mutationFn: ({ userId, roleCode }: { userId: string; roleCode: string }) =>
      apiClient.post("/admin/admins/assign", { userId, roleCode }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "admins"] });
      setShowForm(false);
      setMobileInput("");
      setFoundUserId("");
      setError("");
    },
    onError: () => setError("خطا در تخصیص نقش"),
  });

  const revokeMutation = useMutation({
    mutationFn: (userId: string) => apiClient.delete(`/admin/admins/revoke/${userId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "admins"] }),
  });

  const columns: ColumnDef<AdminUser, unknown>[] = [
    { accessorKey: "fullName", header: "نام" },
    {
      accessorKey: "mobile",
      header: "موبایل",
      cell: ({ getValue }) => <span dir="ltr" className="text-xs">{String(getValue())}</span>,
    },
    {
      accessorKey: "role",
      header: "نقش",
      cell: ({ getValue }) => {
        const r = String(getValue());
        return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${r === "admin" ? "bg-primary/10 text-primary" : "bg-blue-500/10 text-blue-600"}`}>{r}</span>;
      },
    },
    {
      accessorKey: "grantedAt",
      header: "تاریخ تخصیص",
      cell: ({ getValue }) => <span className="text-xs text-muted">{new Date(String(getValue())).toLocaleDateString("fa-IR")}</span>,
    },
    {
      id: "actions",
      header: "عملیات",
      cell: ({ row }) => (
        <button
          onClick={() => revokeMutation.mutate(row.original.userId)}
          className="flex items-center gap-1 rounded-lg bg-red-500/10 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-500/20"
        >
          <Trash2 size={12} />
          لغو نقش
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">مدیران</h1>
          <p className="mt-1 text-xs text-muted">تخصیص و مدیریت نقش‌های ادمین</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
          <UserPlus size={15} />
          افزودن مدیر
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">تخصیص نقش به کاربر</h3>
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-48 flex-1">
              <label className="mb-1 block text-xs text-muted">موبایل کاربر</label>
              <input
                value={mobileInput}
                onChange={e => setMobileInput(e.target.value)}
                placeholder="09xxxxxxxxx"
                dir="ltr"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <button onClick={searchUser} disabled={searching || !mobileInput} className="rounded-xl border border-border px-4 py-2 text-sm hover:bg-background disabled:opacity-50">
              {searching ? "جستجو..." : "یافتن کاربر"}
            </button>
            {foundUserId && (
              <>
                <div>
                  <label className="mb-1 block text-xs text-muted">نقش</label>
                  <select value={roleCode} onChange={e => setRoleCode(e.target.value)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none">
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button
                  onClick={() => assignMutation.mutate({ userId: foundUserId, roleCode })}
                  disabled={assignMutation.isPending}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  تخصیص
                </button>
              </>
            )}
          </div>
          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        </div>
      )}

      <DataTable data={admins} columns={columns} isLoading={isLoading} emptyMessage="مدیری یافت نشد" />
    </div>
  );
}

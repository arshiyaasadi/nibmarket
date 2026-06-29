"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { apiClient } from "@/lib/api/client";
import { DataTable } from "@/components/ui/DataTable";
import { Plus, X, Pencil } from "lucide-react";

interface Mission {
  id: string;
  code: string;
  title: string;
  description: string | null;
  missionType: string;
  rewardAmount: number;
  criteria: unknown;
  verificationMode: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

const MISSION_TYPE_LABELS: Record<string, string> = {
  referral_count: "تعداد معرفی",
  purchase: "خرید",
  registration: "ثبت‌نام",
  fund_issue: "صندوق",
  custom: "سفارشی",
};
const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500/10 text-green-600",
  draft: "bg-gray-500/10 text-gray-500",
  paused: "bg-yellow-500/10 text-yellow-600",
  archived: "bg-red-500/10 text-red-500",
};

const EMPTY_FORM = {
  code: "", title: "", description: "", missionType: "referral_count",
  rewardAmount: "", criteria: "{}", verificationMode: "auto",
  startDate: "", endDate: "", status: "draft",
};

export default function MissionsPageContent() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<{ open: boolean; editing?: Mission }>({ open: false });
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  const { data: missions = [], isLoading } = useQuery<Mission[]>({
    queryKey: ["admin", "missions"],
    queryFn: () => apiClient.get("/admin/missions/list"),
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => apiClient.post("/admin/missions/create", body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "missions"] }); setModal({ open: false }); },
    onError: () => setFormError("خطا در ذخیره مأموریت"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }: Record<string, unknown>) => apiClient.patch(`/admin/missions/${String(id)}`, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "missions"] }); setModal({ open: false }); },
    onError: () => setFormError("خطا در به‌روزرسانی"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient.patch(`/admin/missions/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "missions"] }),
  });

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormError("");
    setModal({ open: true });
  }

  function openEdit(m: Mission) {
    setForm({
      code: m.code, title: m.title, description: m.description ?? "",
      missionType: m.missionType, rewardAmount: String(m.rewardAmount),
      criteria: JSON.stringify(m.criteria ?? {}, null, 2),
      verificationMode: m.verificationMode,
      startDate: m.startDate ? m.startDate.substring(0, 10) : "",
      endDate: m.endDate ? m.endDate.substring(0, 10) : "",
      status: m.status,
    });
    setFormError("");
    setModal({ open: true, editing: m });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    let criteria: unknown = {};
    try { criteria = JSON.parse(form.criteria); } catch { setFormError("فرمت JSON نادرست است"); return; }
    const payload = {
      code: form.code, title: form.title, description: form.description || null,
      missionType: form.missionType, rewardAmount: Number(form.rewardAmount),
      criteria, verificationMode: form.verificationMode,
      startDate: form.startDate || null, endDate: form.endDate || null,
      status: form.status,
    };
    if (modal.editing) {
      updateMutation.mutate({ id: modal.editing.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const columns: ColumnDef<Mission, unknown>[] = [
    {
      accessorKey: "code",
      header: "کد",
      cell: ({ getValue }) => <span className="font-mono text-xs">{String(getValue())}</span>,
    },
    { accessorKey: "title", header: "عنوان" },
    {
      accessorKey: "missionType",
      header: "نوع",
      cell: ({ getValue }) => <span className="text-xs text-muted">{MISSION_TYPE_LABELS[String(getValue())] ?? String(getValue())}</span>,
    },
    {
      accessorKey: "rewardAmount",
      header: "پاداش (Twin)",
      cell: ({ getValue }) => <span className="font-semibold text-primary">{Number(getValue()).toLocaleString("fa-IR")}</span>,
    },
    {
      accessorKey: "status",
      header: "وضعیت",
      cell: ({ getValue }) => {
        const s = String(getValue());
        return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_COLORS[s] ?? ""}`}>{s}</span>;
      },
    },
    {
      accessorKey: "verificationMode",
      header: "تأیید",
      cell: ({ getValue }) => <span className="text-xs text-muted">{String(getValue())}</span>,
    },
    {
      id: "actions",
      header: "عملیات",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEdit(row.original)} className="rounded-lg bg-primary/10 p-1.5 text-primary hover:bg-primary/20">
            <Pencil size={13} />
          </button>
          {row.original.status !== "active" && (
            <button
              onClick={() => statusMutation.mutate({ id: row.original.id, status: "active" })}
              className="rounded-lg bg-green-500/10 px-2 py-1 text-[11px] font-medium text-green-600 hover:bg-green-500/20"
            >
              فعال
            </button>
          )}
          {row.original.status === "active" && (
            <button
              onClick={() => statusMutation.mutate({ id: row.original.id, status: "paused" })}
              className="rounded-lg bg-yellow-500/10 px-2 py-1 text-[11px] font-medium text-yellow-600 hover:bg-yellow-500/20"
            >
              توقف
            </button>
          )}
        </div>
      ),
    },
  ];

  const isBusy = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">مأموریت‌ها</h1>
          <p className="mt-1 text-xs text-muted">ساخت و مدیریت مأموریت‌های سیستم</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
          <Plus size={15} />
          مأموریت جدید
        </button>
      </div>

      <DataTable data={missions} columns={columns} isLoading={isLoading} emptyMessage="مأموریتی یافت نشد" />

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" dir="rtl">
          <div className="w-full max-w-lg rounded-2xl bg-surface shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="font-semibold text-foreground">{modal.editing ? "ویرایش مأموریت" : "مأموریت جدید"}</h2>
              <button onClick={() => setModal({ open: false })} className="text-muted hover:text-foreground"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">کد *</label>
                  <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} required className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" dir="ltr" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">عنوان *</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">توضیحات</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">نوع مأموریت</label>
                  <select value={form.missionType} onChange={e => setForm(f => ({ ...f, missionType: e.target.value }))} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none">
                    {Object.entries(MISSION_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">پاداش (Twin)</label>
                  <input type="number" value={form.rewardAmount} onChange={e => setForm(f => ({ ...f, rewardAmount: e.target.value }))} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" dir="ltr" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">معیار (JSON)</label>
                <textarea value={form.criteria} onChange={e => setForm(f => ({ ...f, criteria: e.target.value }))} rows={3} className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 font-mono text-xs outline-none focus:border-primary" dir="ltr" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">حالت تأیید</label>
                  <select value={form.verificationMode} onChange={e => setForm(f => ({ ...f, verificationMode: e.target.value }))} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none">
                    <option value="auto">خودکار</option>
                    <option value="manual">دستی</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">وضعیت</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none">
                    <option value="draft">پیش‌نویس</option>
                    <option value="active">فعال</option>
                    <option value="paused">متوقف</option>
                    <option value="archived">بایگانی</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">تاریخ شروع</label>
                  <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" dir="ltr" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">تاریخ پایان</label>
                  <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" dir="ltr" />
                </div>
              </div>
              {formError && <p className="text-xs text-red-500">{formError}</p>}
              <div className="flex justify-end gap-3 border-t border-border pt-4">
                <button type="button" onClick={() => setModal({ open: false })} className="rounded-xl border border-border px-4 py-2 text-sm text-muted hover:text-foreground">انصراف</button>
                <button type="submit" disabled={isBusy} className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
                  {isBusy ? "در حال ذخیره..." : modal.editing ? "به‌روزرسانی" : "ایجاد"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

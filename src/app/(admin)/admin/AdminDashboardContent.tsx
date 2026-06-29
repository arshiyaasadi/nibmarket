"use client";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { Users, UserCheck, Target } from "lucide-react";

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  activeMissions: number;
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="text-2xl font-bold text-foreground tabular-nums">{value.toLocaleString("fa-IR")}</p>
      </div>
    </div>
  );
}

export default function AdminDashboardContent() {
  const { data, isLoading } = useQuery<AdminStats>({
    queryKey: ["admin", "stats"],
    queryFn: () => apiClient.get("/admin/stats"),
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">داشبورد مدیریت</h1>
        <p className="mt-1 text-xs text-muted">NIB Club — پنل مدیریت</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="کل کاربران" value={data?.totalUsers ?? 0} icon={Users} color="bg-blue-500/10 text-blue-500" />
        <StatCard label="کاربران فعال" value={data?.activeUsers ?? 0} icon={UserCheck} color="bg-green-500/10 text-green-500" />
        <StatCard label="مأموریت‌های فعال" value={data?.activeMissions ?? 0} icon={Target} color="bg-primary/10 text-primary" />
      </div>
    </div>
  );
}

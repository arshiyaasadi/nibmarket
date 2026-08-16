"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Bell, Coins, Layers, Map, Network, Target, UserCheck, Users } from "lucide-react";
import { CityDensityShortcuts } from "@/components/organisms/admin/CityDensityShortcuts";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  activeMissions: number;
}

const QUICK_LINKS = [
  { href: ROUTES.ADMIN.USERS, labelKey: "users", icon: Users },
  { href: ROUTES.ADMIN.USER_MAP, labelKey: "userMap", icon: Map },
  { href: ROUTES.ADMIN.TWIN, labelKey: "twin", icon: Coins },
  { href: ROUTES.ADMIN.SEDIMENT, labelKey: "sediment", icon: Layers },
  { href: "/admin/network", labelKey: "network", icon: Network },
  { href: "/admin/missions", labelKey: "missions", icon: Target },
  { href: ROUTES.ADMIN.NOTIFICATIONS, labelKey: "notifications", icon: Bell },
] as const;

function pn(value: number) {
  return value.toLocaleString("fa-IR");
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="border-border bg-surface flex items-center gap-4 rounded-2xl border p-5">
      <div className={cn("flex size-12 shrink-0 items-center justify-center rounded-xl", color)}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-muted text-xs">{label}</p>
        <p className="text-foreground text-2xl font-bold tabular-nums">{pn(value)}</p>
      </div>
    </div>
  );
}

function QuickAccess() {
  const t = useTranslations("admin.dashboard");
  const tNav = useTranslations("admin.nav");

  return (
    <section className="border-border bg-surface flex flex-col gap-4 rounded-2xl border p-5">
      <h2 className="text-foreground text-sm font-semibold">{t("quickAccessTitle")}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {QUICK_LINKS.map(({ href, labelKey, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="border-border text-muted hover:border-primary/40 hover:text-primary flex flex-col items-center gap-2 rounded-xl border p-4 text-xs font-medium transition-colors"
          >
            <Icon size={18} />
            {tNav(labelKey)}
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function AdminDashboardContent() {
  const t = useTranslations("admin.dashboard");
  const { data, isLoading } = useQuery<AdminStats>({
    queryKey: ["admin", "stats"],
    queryFn: () => apiClient.get(ENDPOINTS.ADMIN.STATS),
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="border-primary size-8 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-foreground text-xl font-bold">{t("title")}</h1>
        <p className="text-muted mt-1 text-xs">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label={t("statTotalUsers")}
          value={data?.totalUsers ?? 0}
          icon={Users}
          color="bg-blue-500/10 text-blue-500"
        />
        <StatCard
          label={t("statActiveUsers")}
          value={data?.activeUsers ?? 0}
          icon={UserCheck}
          color="bg-green-500/10 text-green-500"
        />
        <StatCard
          label={t("statActiveMissions")}
          value={data?.activeMissions ?? 0}
          icon={Target}
          color="bg-primary/10 text-primary"
        />
      </div>

      <CityDensityShortcuts />

      <QuickAccess />
    </div>
  );
}

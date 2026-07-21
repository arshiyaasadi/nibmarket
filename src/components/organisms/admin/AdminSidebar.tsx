"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Users,
  Network,
  Target,
  LogOut,
  Coins,
  Trophy,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { performLogout } from "@/lib/auth/session";
import { ROUTES } from "@/config/routes";

const NAV = [
  { href: ROUTES.ADMIN.ROOT, labelKey: "dashboard", icon: LayoutDashboard, exact: true },
  { href: ROUTES.ADMIN.USERS, labelKey: "users", icon: Users, exact: false },
  { href: ROUTES.ADMIN.TWIN, labelKey: "twin", icon: Coins, exact: false },
  { href: ROUTES.ADMIN.POOL, labelKey: "pool", icon: Trophy, exact: false },
  { href: ROUTES.ADMIN.SEDIMENT, labelKey: "sediment", icon: Layers, exact: false },
  { href: "/admin/network", labelKey: "network", icon: Network, exact: false },
  { href: "/admin/missions", labelKey: "missions", icon: Target, exact: false },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const t = useTranslations("admin.nav");

  async function handleLogout() {
    await performLogout();
  }

  return (
    <aside
      className="border-border bg-surface fixed start-0 top-0 z-40 flex h-screen w-56 flex-col border-e"
      dir="rtl"
    >
      <div className="border-border flex h-14 items-center border-b px-4">
        <span className="text-primary text-sm font-bold">NIB Club</span>
        <span className="bg-primary/10 text-primary ms-2 rounded-md px-2 py-0.5 text-[11px] font-semibold">
          {t("brandAdmin")}
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {NAV.map(({ href, labelKey, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted hover:bg-background hover:text-foreground",
              )}
            >
              <Icon size={17} />
              {t(labelKey)}
            </Link>
          );
        })}
      </nav>

      <div className="border-border border-t p-3">
        <button
          onClick={handleLogout}
          className="text-muted hover:bg-background flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:text-red-500"
        >
          <LogOut size={17} />
          {t("logout")}
        </button>
      </div>
    </aside>
  );
}

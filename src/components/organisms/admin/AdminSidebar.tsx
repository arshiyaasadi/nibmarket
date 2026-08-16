/**
 * @level organism
 * Fixed rail: collapsed shows icons only, hover expands over the content.
 */
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  Shield,
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

/** Keep in sync with the `ps-*` offset in the admin layout. */
export const ADMIN_SIDEBAR_COLLAPSED_W = "4.5rem";
const ADMIN_SIDEBAR_EXPANDED_W = "16rem";

export function AdminSidebar() {
  const pathname = usePathname();
  const t = useTranslations("admin.nav");
  const [expanded, setExpanded] = useState(false);

  async function handleLogout() {
    await performLogout();
  }

  const labelCls = cn(
    "truncate text-start transition-[opacity,width] duration-300 ease-out",
    expanded ? "w-auto opacity-100" : "w-0 opacity-0",
  );

  return (
    <aside
      className="border-border bg-surface fixed inset-y-0 start-0 z-50 flex h-screen flex-col overflow-hidden border-e shadow-lg shadow-black/5 transition-[width] duration-300 ease-out"
      style={{ width: expanded ? ADMIN_SIDEBAR_EXPANDED_W : ADMIN_SIDEBAR_COLLAPSED_W }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      dir="rtl"
    >
      <div className="border-border flex h-14 items-center gap-3 border-b px-5">
        <Shield className="text-primary size-5 shrink-0" />
        <span className={cn("flex items-center gap-2 whitespace-nowrap", labelCls)}>
          <span className="text-primary text-sm font-bold">باشگاه مشتریان نوین</span>
          <span className="bg-primary/10 text-primary rounded-md px-2 py-0.5 text-[11px] font-semibold">
            {t("brandAdmin")}
          </span>
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto p-3">
        {NAV.map(({ href, labelKey, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={t(labelKey)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted hover:bg-background hover:text-foreground",
              )}
            >
              <Icon size={19} className="shrink-0" />
              <span className={labelCls}>{t(labelKey)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-border flex flex-col gap-1 border-t p-3">
        <button
          onClick={handleLogout}
          title={t("logout")}
          className="text-muted hover:bg-background flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors hover:text-red-500"
        >
          <LogOut size={19} className="shrink-0" />
          <span className={labelCls}>{t("logout")}</span>
        </button>
      </div>
    </aside>
  );
}

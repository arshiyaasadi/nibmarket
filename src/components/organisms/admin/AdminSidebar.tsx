/**
 * @level organism
 * Liquid-glass island rail — collapsed shows icons only, hover expands over the content.
 * Mirrors the client PanelSidebar styling.
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
  Map,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { performLogout } from "@/lib/auth/session";
import { ROUTES } from "@/config/routes";

const NAV = [
  { href: ROUTES.ADMIN.ROOT, labelKey: "dashboard", icon: LayoutDashboard, exact: true },
  { href: ROUTES.ADMIN.USERS, labelKey: "users", icon: Users, exact: false },
  { href: ROUTES.ADMIN.USER_MAP, labelKey: "userMap", icon: Map, exact: false },
  { href: ROUTES.ADMIN.TWIN, labelKey: "twin", icon: Coins, exact: false },
  { href: ROUTES.ADMIN.POOL, labelKey: "pool", icon: Trophy, exact: false },
  { href: ROUTES.ADMIN.SEDIMENT, labelKey: "sediment", icon: Layers, exact: false },
  { href: "/admin/network", labelKey: "network", icon: Network, exact: false },
  { href: "/admin/missions", labelKey: "missions", icon: Target, exact: false },
] as const;

/** Matches the client panel rail so both shells feel identical. */
const COLLAPSED_W = "5.5rem";
const EXPANDED_W = "17rem";

export function AdminSidebar() {
  const pathname = usePathname();
  const t = useTranslations("admin.nav");
  const [expanded, setExpanded] = useState(false);

  async function handleLogout() {
    await performLogout();
  }

  // `flex-1` must not apply while collapsed — a growing label pushes the icon off-center.
  const labelCls = cn(
    "truncate text-start transition-all duration-300",
    expanded ? "ms-[0.625rem] w-auto flex-1 opacity-100" : "w-0 opacity-0",
  );

  const itemCls = (active?: boolean) =>
    cn(
      "group flex w-full items-center rounded-xl py-[0.625rem] text-sm font-medium transition-all duration-300",
      "overflow-hidden whitespace-nowrap",
      expanded ? "px-[0.875rem]" : "justify-center px-0",
      active
        ? "border-white/30 bg-white/20 text-primary shadow-primary/10 border shadow-lg backdrop-blur-md dark:border-white/15 dark:bg-white/10"
        : "text-muted hover:text-foreground border border-transparent hover:border-white/20 hover:bg-white/10 hover:backdrop-blur-md",
    );

  return (
    <div
      className="fixed inset-y-0 start-0 z-[1100] flex flex-col p-3 pt-[4.75rem]"
      style={{
        width: expanded ? EXPANDED_W : COLLAPSED_W,
        transition: "width 300ms cubic-bezier(0.4,0,0.2,1)",
      }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      dir="rtl"
    >
      {/* Glass card */}
      <div className="relative flex grow flex-col overflow-hidden rounded-3xl border border-white/20 bg-white/10 py-4 shadow-2xl shadow-black/10 backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-white/5">
        {/* Sheen overlays */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-white/30 via-white/5 to-transparent dark:from-white/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-3xl bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/20"
        />

        <div
          className={cn(
            "relative flex items-center px-2 pb-3",
            expanded ? "gap-2 px-[0.875rem]" : "justify-center",
          )}
        >
          <Shield className="text-primary size-5 shrink-0" />
          <span className={cn("flex items-center gap-2", labelCls)}>
            <span className="bg-primary/10 text-primary rounded-md px-2 py-0.5 text-[11px] font-semibold">
              {t("brandAdmin")}
            </span>
          </span>
        </div>

        <nav className="relative flex flex-1 flex-col gap-[2px] overflow-x-hidden overflow-y-auto px-2">
          {NAV.map(({ href, labelKey, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href} title={t(labelKey)} className={itemCls(active)}>
                <Icon
                  size={20}
                  className={cn(
                    "shrink-0 transition-transform duration-300 group-hover:scale-110",
                    active ? "text-primary" : "text-current",
                  )}
                />
                <span className={labelCls}>{t(labelKey)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="relative px-2 pt-2">
          <button
            onClick={handleLogout}
            title={t("logout")}
            className={cn(itemCls(), "hover:text-red-500")}
          >
            <LogOut
              size={20}
              className="shrink-0 transition-transform duration-300 group-hover:scale-110"
            />
            <span className={labelCls}>{t("logout")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

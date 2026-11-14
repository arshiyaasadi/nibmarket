/**
 * @level organism
 * Liquid-glass island rail — collapsed shows icons only, hover expands over the content.
 * Branch parents use exclusive accordion: only one submenu open at a time.
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
  MessageSquare,
  List,
  Vault,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { performLogout } from "@/lib/auth/session";
import { ROUTES } from "@/config/routes";

type NavLeaf = {
  href: string;
  labelKey: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

type NavBranch = {
  kind: "branch";
  href: string;
  labelKey: string;
  icon: typeof LayoutDashboard;
  children: { href: string; labelKey: string; icon: typeof LayoutDashboard }[];
};

type NavEntry = ({ kind?: "leaf" } & NavLeaf) | NavBranch;

/** Overview paths that are prefixes of sibling routes — match exact only. */
const EXACT_CHILD_HREFS = new Set<string>([ROUTES.ADMIN.USERS, ROUTES.ADMIN.TWIN]);

const NAV: NavEntry[] = [
  { href: ROUTES.ADMIN.ROOT, labelKey: "dashboard", icon: LayoutDashboard, exact: true },
  {
    kind: "branch",
    href: ROUTES.ADMIN.USERS,
    labelKey: "users",
    icon: Users,
    children: [
      { href: ROUTES.ADMIN.USERS, labelKey: "usersList", icon: List },
      { href: ROUTES.ADMIN.USER_MAP, labelKey: "userMap", icon: Map },
    ],
  },
  { href: ROUTES.ADMIN.SYSTEM_MESSAGES, labelKey: "systemMessages", icon: MessageSquare },
  {
    kind: "branch",
    href: ROUTES.ADMIN.TWIN,
    labelKey: "twin",
    icon: Coins,
    children: [
      { href: ROUTES.ADMIN.TWIN, labelKey: "twinOverview", icon: Coins },
      { href: ROUTES.ADMIN.TWIN_TREASURY, labelKey: "twinTreasury", icon: Vault },
      { href: ROUTES.ADMIN.TWIN_PRICE, labelKey: "twinPrice", icon: Coins },
    ],
  },
  { href: ROUTES.ADMIN.POOL, labelKey: "pool", icon: Trophy },
  { href: ROUTES.ADMIN.SEDIMENT, labelKey: "sediment", icon: Layers },
  { href: "/admin/network", labelKey: "network", icon: Network },
  { href: "/admin/missions", labelKey: "missions", icon: Target },
];

function branchMatchesPath(entry: NavBranch, pathname: string): boolean {
  if (pathname === entry.href || pathname.startsWith(`${entry.href}/`)) return true;
  return entry.children.some((c) => pathname === c.href || pathname.startsWith(`${c.href}/`));
}

function findOpenBranchForPath(pathname: string): string | null {
  for (const entry of NAV) {
    if (entry.kind === "branch" && branchMatchesPath(entry, pathname)) return entry.href;
  }
  return null;
}

/** Matches the client panel rail so both shells feel identical. */
const COLLAPSED_W = "5.5rem";
const EXPANDED_W = "17rem";

export function AdminSidebar() {
  const pathname = usePathname();
  const t = useTranslations("admin.nav");
  const [expanded, setExpanded] = useState(false);
  /**
   * Exclusive accordion override for the current pathname.
   * When `forPath` does not match, follow the route-derived branch instead (no effect sync).
   */
  const [accordion, setAccordion] = useState<{ branch: string | null; forPath: string }>(() => ({
    branch: findOpenBranchForPath(pathname),
    forPath: pathname,
  }));
  const openBranch =
    accordion.forPath === pathname ? accordion.branch : findOpenBranchForPath(pathname);

  function toggleBranch(href: string) {
    setAccordion((prev) => {
      const current = prev.forPath === pathname ? prev.branch : findOpenBranchForPath(pathname);
      return {
        branch: current === href ? null : href,
        forPath: pathname,
      };
    });
  }

  function setOpenBranch(branch: string | null) {
    setAccordion({ branch, forPath: pathname });
  }

  async function handleLogout() {
    await performLogout();
  }

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

  const subItemCls = (active?: boolean) =>
    cn(
      "group flex w-full items-center rounded-lg py-2 text-xs font-medium transition-all duration-300",
      "overflow-hidden whitespace-nowrap ps-3 pe-[0.875rem]",
      active ? "bg-white/15 text-primary" : "text-muted hover:bg-white/10 hover:text-foreground",
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
      <div className="relative flex grow flex-col overflow-hidden rounded-3xl border border-white/20 bg-white/10 py-4 shadow-2xl shadow-black/10 backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-white/5">
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
          {NAV.map((entry) => {
            if (entry.kind === "branch") {
              const branchActive = branchMatchesPath(entry, pathname);
              const isOpen = openBranch === entry.href;
              const Icon = entry.icon;
              return (
                <div key={entry.href} className="flex flex-col gap-[2px]">
                  {expanded ? (
                    <button
                      type="button"
                      title={t(entry.labelKey)}
                      aria-expanded={isOpen}
                      onClick={() => toggleBranch(entry.href)}
                      className={itemCls(branchActive && !isOpen)}
                    >
                      <Icon
                        size={20}
                        className={cn(
                          "shrink-0 transition-transform duration-300 group-hover:scale-110",
                          branchActive ? "text-primary" : "text-current",
                        )}
                      />
                      <span className={labelCls}>{t(entry.labelKey)}</span>
                      <ChevronDown
                        size={14}
                        className={cn(
                          "ms-auto shrink-0 opacity-70 transition-transform duration-200",
                          isOpen && "rotate-180",
                        )}
                      />
                    </button>
                  ) : (
                    <Link
                      href={entry.href}
                      title={t(entry.labelKey)}
                      className={itemCls(branchActive)}
                      onClick={() => setOpenBranch(entry.href)}
                    >
                      <Icon
                        size={20}
                        className={cn(
                          "shrink-0 transition-transform duration-300 group-hover:scale-110",
                          branchActive ? "text-primary" : "text-current",
                        )}
                      />
                      <span className={labelCls}>{t(entry.labelKey)}</span>
                    </Link>
                  )}
                  {expanded && isOpen && (
                    <div className="mb-1 flex flex-col gap-[2px] ps-2 pe-1">
                      {entry.children.map((child) => {
                        const ChildIcon = child.icon;
                        const childActive = EXACT_CHILD_HREFS.has(child.href)
                          ? pathname === child.href
                          : pathname === child.href || pathname.startsWith(`${child.href}/`);
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            title={t(child.labelKey)}
                            className={subItemCls(childActive)}
                          >
                            <ChildIcon size={14} className="shrink-0" />
                            <span className="ms-2 truncate">{t(child.labelKey)}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const active = entry.exact
              ? pathname === entry.href
              : pathname === entry.href || pathname.startsWith(`${entry.href}/`);
            const Icon = entry.icon;
            return (
              <Link
                key={entry.href}
                href={entry.href}
                title={t(entry.labelKey)}
                className={itemCls(active)}
                onClick={() => setOpenBranch(null)}
              >
                <Icon
                  size={20}
                  className={cn(
                    "shrink-0 transition-transform duration-300 group-hover:scale-110",
                    active ? "text-primary" : "text-current",
                  )}
                />
                <span className={labelCls}>{t(entry.labelKey)}</span>
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

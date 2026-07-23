/**
 * @level organism
 * Desktop: fixed overlay sidebar — collapsed (icons only) → hover-expanded (icons + labels)
 * Mobile: hidden (hamburger-triggered drawer, TODO)
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Layers,
  Wallet,
  Users,
  Trophy,
  Target,
  ScrollText,
  Landmark,
  X,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PROJECT } from "@/config/project";
import { ROUTES } from "@/config/routes";
import { isAdminRole } from "@/config/roles";
import { useUserRole } from "@/store/hooks/use-auth";

interface NavChild {
  key: string;
  label: string;
  href: string;
}

interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  children?: NavChild[];
}

interface PanelSidebarProps {
  open: boolean;
  onClose: () => void;
}

const COLLAPSED_W = "5.5rem"; // 72px — icon only
const EXPANDED_W = "17rem"; // 272px — icon + label

export function PanelSidebar({ open, onClose }: PanelSidebarProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const role = useUserRole();
  const [hovered, setHovered] = useState(false);

  const isExpanded = hovered;
  const showAdminLink = role ? isAdminRole(role) : false;

  const mainNav: NavItem[] = [
    {
      key: "dashboard",
      label: t("dashboard"),
      icon: <LayoutDashboard className="size-5" />,
      href: ROUTES.DASHBOARD,
    },
    {
      key: "wallet",
      label: `${t("wallet")} ${PROJECT.token.name}`,
      icon: <Wallet className="size-5" />,
      href: ROUTES.WALLET,
    },
    {
      key: "subset-deposits",
      label: t("subsetDeposits"),
      icon: <Layers className="size-5" />,
      href: ROUTES.SUBSET_DEPOSITS,
    },
    {
      key: "network",
      label: t("network"),
      icon: <Users className="size-5" />,
      href: ROUTES.NETWORK.ROOT,
    },
    {
      key: "leaderboard",
      label: t("leaderboard"),
      icon: <Trophy className="size-5" />,
      href: ROUTES.LEADERBOARD.POOL,
    },
    {
      key: "missions",
      label: t("missions"),
      icon: <Target className="size-5" />,
      href: ROUTES.MISSIONS,
    },
  ];

  const guidelineNav: NavChild[] = [
    { key: "rules-network", label: t("rulesNetwork"), href: ROUTES.RULES },
    { key: "rules-deposit", label: t("rulesDeposit"), href: ROUTES.CAPITAL },
  ];

  const isActive = (href: string) => {
    if (href === ROUTES.DASHBOARD) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const itemCls = (active: boolean) =>
    cn(
      "group flex w-full items-center rounded-xl px-[0.875rem] py-[0.625rem] text-sm font-medium transition-all duration-300",
      "overflow-hidden whitespace-nowrap",
      active
        ? "border border-white/30 bg-white/20 text-primary shadow-lg shadow-primary/10 backdrop-blur-md dark:border-white/15 dark:bg-white/10"
        : "border border-transparent text-muted hover:border-white/20 hover:bg-white/10 hover:text-foreground hover:backdrop-blur-md",
    );

  const iconCls = (active: boolean) =>
    cn(
      "shrink-0 transition-transform duration-300 group-hover:scale-110",
      active ? "text-primary" : "text-current",
    );

  return (
    <>
      {/* Desktop: fixed island sidebar */}
      <div
        className="absolut mt-16 hidden lg:fixed lg:inset-y-0 lg:start-0 lg:z-50 lg:flex lg:h-[90vh] lg:flex-col lg:p-3"
        style={{
          width: isExpanded ? EXPANDED_W : COLLAPSED_W,
          transition: "width 300ms cubic-bezier(0.4,0,0.2,1)",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Glass card */}
        <div className="pb-pad-mol pt-pad-mol relative flex grow flex-col overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl shadow-black/10 backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-white/5">
          {/* Sheen overlays */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-white/30 via-white/5 to-transparent dark:from-white/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-3xl bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/20"
          />

          {/* Nav */}
          <nav className="gap-mol relative flex flex-1 flex-col justify-between overflow-x-hidden overflow-y-auto px-2">
            {/* Main items */}
            <ul role="list" className="flex flex-col gap-[2px]">
              {mainNav.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href!}
                    onClick={onClose}
                    className={itemCls(isActive(item.href!))}
                  >
                    <span className={iconCls(isActive(item.href!))}>{item.icon}</span>
                    <span
                      className="ms-[0.625rem] flex-1 truncate transition-all duration-300"
                      style={{ opacity: isExpanded ? 1 : 0, width: isExpanded ? "auto" : 0 }}
                    >
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            {showAdminLink && (
              <ul role="list" className="flex flex-col gap-[2px]">
                <li>
                  <Link
                    href={ROUTES.ADMIN.ROOT}
                    onClick={onClose}
                    className={itemCls(pathname.startsWith(ROUTES.ADMIN.ROOT))}
                  >
                    <span className={iconCls(pathname.startsWith(ROUTES.ADMIN.ROOT))}>
                      <Shield className="size-5" />
                    </span>
                    <span
                      className="ms-[0.625rem] flex-1 truncate transition-all duration-300"
                      style={{ opacity: isExpanded ? 1 : 0, width: isExpanded ? "auto" : 0 }}
                    >
                      {t("adminPanel")}
                    </span>
                  </Link>
                </li>
              </ul>
            )}

            {/* Guidelines */}
            <div className="flex flex-col gap-[2px]">
              <div
                className="py-atom text-muted/80 overflow-hidden px-[0.875rem] text-xs font-semibold tracking-wide whitespace-nowrap uppercase transition-all duration-300"
                style={{ opacity: isExpanded ? 1 : 0 }}
              >
                {t("guidelinesTitle")}
              </div>
              <ul role="list" className="flex flex-col gap-[2px]">
                {guidelineNav.map((item) => (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={itemCls(isActive(item.href))}
                    >
                      {item.key === "rules-network" ? (
                        <ScrollText
                          aria-hidden="true"
                          className="size-5 shrink-0 transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <Landmark
                          aria-hidden="true"
                          className="size-5 shrink-0 transition-transform duration-300 group-hover:scale-110"
                        />
                      )}
                      <span
                        className="ms-[0.625rem] flex-1 truncate transition-all duration-300"
                        style={{ opacity: isExpanded ? 1 : 0, width: isExpanded ? "auto" : 0 }}
                      >
                        {item.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile: bottom island nav bar */}
      <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center lg:hidden">
        <div className="bg-foreground/80 relative flex items-center gap-2 rounded-2xl border border-white/25 px-4 py-2.5 shadow-2xl shadow-black/20 backdrop-blur-2xl backdrop-saturate-150 dark:bg-black/60">
          {/* Sheen */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-white/40 to-transparent"
          />

          {mainNav.map((item) => {
            const href = item.href!;
            const active = isActive(href);
            return (
              <Link
                key={item.key}
                href={href}
                aria-label={item.label}
                className={cn(
                  "relative flex size-12 items-center justify-center rounded-xl transition-all duration-200",
                  active
                    ? "bg-primary/20 text-primary shadow-sm"
                    : "text-white/60 hover:bg-white/10 hover:text-white",
                )}
              >
                {active && (
                  <span className="bg-primary absolute bottom-1.5 left-1/2 size-1 -translate-x-1/2 rounded-full" />
                )}
                {item.icon}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile drawer — backdrop + slide */}
      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden" dir="rtl">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <div className="relative flex w-72 flex-col p-3">
            <MobileDrawerContent
              mainNav={mainNav}
              guidelineNav={guidelineNav}
              isActive={isActive}
              onClose={onClose}
              t={t}
              showAdminLink={showAdminLink}
            />
          </div>
        </div>
      )}
    </>
  );
}

function MobileDrawerContent({
  mainNav,
  guidelineNav,
  isActive,
  onClose,
  t,
  showAdminLink,
}: {
  mainNav: NavItem[];
  guidelineNav: NavChild[];
  isActive: (href: string) => boolean;
  onClose: () => void;
  t: (key: string) => string;
  showAdminLink: boolean;
}) {
  const itemCls = (active: boolean) =>
    cn(
      "group flex w-full items-center gap-atom-md rounded-xl px-pad-atom-md py-[0.625rem] text-sm font-medium transition-all duration-300",
      active
        ? "border border-white/30 bg-white/20 text-primary shadow-lg shadow-primary/10 backdrop-blur-md dark:border-white/15 dark:bg-white/10"
        : "border border-transparent text-muted hover:border-white/20 hover:bg-white/10 hover:text-foreground hover:backdrop-blur-md",
    );

  return (
    <div className="pb-pad-mol pt-pad-mol relative flex grow flex-col overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl shadow-black/10 backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-white/5">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-white/30 via-white/5 to-transparent dark:from-white/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-3xl bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/20"
      />

      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="text-muted hover:text-foreground relative ms-auto me-3 mb-2 flex size-8 items-center justify-center rounded-lg hover:bg-white/10"
      >
        <X className="size-4" />
      </button>

      <nav className="gap-mol relative flex flex-1 flex-col overflow-y-auto px-2">
        <ul role="list" className="flex flex-col gap-[2px]">
          {mainNav.map((item) => (
            <li key={item.key}>
              <Link href={item.href!} onClick={onClose} className={itemCls(isActive(item.href!))}>
                <span
                  className={cn("shrink-0", isActive(item.href!) ? "text-primary" : "text-current")}
                >
                  {item.icon}
                </span>
                <span className="flex-1 truncate">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
        {showAdminLink && (
          <ul role="list" className="flex flex-col gap-[2px]">
            <li>
              <Link
                href={ROUTES.ADMIN.ROOT}
                onClick={onClose}
                className={itemCls(isActive(ROUTES.ADMIN.ROOT))}
              >
                <Shield aria-hidden="true" className="size-5 shrink-0" />
                <span className="flex-1 truncate">{t("adminPanel")}</span>
              </Link>
            </li>
          </ul>
        )}
        <div className="flex flex-col gap-[2px]">
          <div className="px-pad-atom-md py-atom text-muted/80 text-xs font-semibold tracking-wide uppercase">
            {t("guidelinesTitle")}
          </div>
          <ul role="list" className="flex flex-col gap-[2px]">
            {guidelineNav.map((item) => (
              <li key={item.key}>
                <Link href={item.href} onClick={onClose} className={itemCls(isActive(item.href))}>
                  {item.key === "rules-network" ? (
                    <ScrollText aria-hidden="true" className="size-5 shrink-0" />
                  ) : (
                    <Landmark aria-hidden="true" className="size-5 shrink-0" />
                  )}
                  <span className="flex-1 truncate">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
}

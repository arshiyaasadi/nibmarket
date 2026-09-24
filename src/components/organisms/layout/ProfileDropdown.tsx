/**
 * @level organism
 * @spacing internal: gap-atom-md (items), p-pad-mol (sections) | external: none
 */
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  LogOut,
  UserCircle,
  History,
  Link2,
  ChevronRight,
  ExternalLink,
  Shield,
  Info,
  MonitorSmartphone,
  BadgeCheck,
} from "lucide-react";
import { BottomSheetPanel, Modal, ModalBody, Tabs } from "@/components/atoms";
import { ThemeToggle } from "./ThemeToggle";
import { performLogout } from "@/lib/auth/session";
import { BFF_API_BASE } from "@/lib/api/endpoints";
import { getPanelProfileUrl } from "@/config/sso";
import { ROUTES } from "@/config/routes";
import { isAdminRole } from "@/config/roles";
import { useSession } from "@/hooks/use-session";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn, formatDisplayDate, formatDisplayDateTime } from "@/lib/utils";
import type { LoginActivity } from "@/types/mlm";
import packageInfo from "../../../../package.json";

const gitSha = process.env.NEXT_PUBLIC_GIT_SHA;
const displayVersion = gitSha ? `${packageInfo.version}+${gitSha}` : packageInfo.version;

type ProfileDetails = {
  fullName: string;
  mobile: string;
  email: string;
  birthDate: string | null;
  nationalId: string | null;
  nibMarketLinked: boolean;
  recentSessions: LoginActivity[];
};

type ProfileTab = "info" | "sessions" | "application";
type SheetView = "menu" | ProfileTab;

export function ProfileDropdown() {
  const t = useTranslations("auth");
  const tNav = useTranslations("nav");
  const isMobile = useIsMobile();
  const { fullName, role, inviteCode } = useSession();
  const showAdminLink = role ? isAdminRole(role) : false;

  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetView, setSheetView] = useState<SheetView>("menu");
  const [activeTab, setActiveTab] = useState<ProfileTab>("info");
  const [profileDetails, setProfileDetails] = useState<ProfileDetails | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const res = await fetch(`${BFF_API_BASE}/auth/profile`, { credentials: "include" });
      if (res.ok) {
        setProfileDetails(await res.json());
      }
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  function onEnter() {
    if (isMobile) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpen(true), 120);
  }

  function onLeave() {
    if (isMobile) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpen(false), 180);
  }

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  function openProfile(tab: ProfileTab = "info") {
    setOpen(false);
    setActiveTab(tab);
    if (tab !== "application") void fetchProfile();

    if (isMobile) {
      setSheetView(tab);
      setSheetOpen(true);
      return;
    }

    setProfileOpen(true);
  }

  function openMobileMenu() {
    setSheetView("menu");
    setSheetOpen(true);
  }

  function closeSheet() {
    setSheetOpen(false);
    setTimeout(() => setSheetView("menu"), 250);
  }

  async function handleLogout() {
    setOpen(false);
    closeSheet();
    await performLogout();
  }

  function handleIconClick() {
    if (isMobile) {
      openMobileMenu();
      return;
    }
    openProfile("info");
  }

  const profileContent =
    loadingProfile && !profileDetails ? (
      <div className="flex h-24 items-center justify-center">
        <div className="border-primary h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    ) : (
      <ProfileInfoTab
        fullName={profileDetails?.fullName ?? fullName}
        mobile={profileDetails?.mobile}
        email={profileDetails?.email}
        birthDate={profileDetails?.birthDate}
        nationalId={profileDetails?.nationalId}
        inviteCode={inviteCode}
        role={role}
      />
    );

  const sessionsContent = <SessionsTab recentSessions={profileDetails?.recentSessions ?? []} />;
  const applicationContent = <ApplicationInfoTab />;

  const sheetTitle =
    sheetView === "menu"
      ? fullName || t("viewProfile")
      : sheetView === "info"
        ? t("profileTitle")
        : sheetView === "sessions"
          ? t("sessionsTab")
          : t("applicationTab");

  return (
    <>
      <div ref={ref} className="relative" dir="rtl" onMouseEnter={onEnter} onMouseLeave={onLeave}>
        <button
          type="button"
          aria-label={t("viewProfile")}
          onClick={handleIconClick}
          className="p-pad-atom text-muted hover:bg-surface-2 hover:text-foreground flex items-center justify-center rounded-lg transition-colors"
        >
          <UserCircle className="size-6" />
        </button>

        {!isMobile && open && (
          <div className="mt-atom-md border-border bg-surface absolute end-0 top-full z-50 w-72 overflow-hidden rounded-xl border shadow-lg">
            <ProfileMenuHeader fullName={fullName} role={role} />

            <div className="px-pad-mol py-pad-atom-md border-border flex items-center justify-between border-b">
              <span className="text-muted text-xs">{t("theme")}</span>
              <ThemeToggle />
            </div>

            <div className="p-pad-atom-md flex flex-col">
              {showAdminLink && (
                <MenuLink icon={Shield} href={ROUTES.ADMIN.ROOT}>
                  {tNav("adminPanel")}
                </MenuLink>
              )}
              <MenuButton icon={UserCircle} onClick={() => openProfile("info")}>
                {t("viewProfile")}
              </MenuButton>
              <MenuButton icon={History} onClick={() => openProfile("sessions")}>
                {t("sessionsMenuItem")}
              </MenuButton>
              <MenuButton icon={Info} onClick={() => openProfile("application")}>
                {t("applicationMenuItem")}
              </MenuButton>
              <MenuButton icon={LogOut} onClick={handleLogout} danger>
                {t("logout")}
              </MenuButton>
            </div>
          </div>
        )}
      </div>

      {isMobile && (
        <BottomSheetPanel open={sheetOpen} onClose={closeSheet} title={sheetTitle}>
          <div className="flex flex-col gap-5">
            {sheetView !== "menu" && (
              <button
                type="button"
                onClick={() => setSheetView("menu")}
                className="text-muted hover:text-foreground flex items-center gap-1 self-start text-xs"
              >
                <ChevronRight className="size-4" />
                {t("backButton")}
              </button>
            )}

            {sheetView === "menu" && (
              <>
                <ProfileMenuHeader fullName={fullName} role={role} compact />

                <div className="border-border flex items-center justify-between rounded-2xl border px-4 py-3.5">
                  <span className="text-muted text-sm">{t("theme")}</span>
                  <ThemeToggle />
                </div>

                <div className="flex flex-col gap-1">
                  {showAdminLink && (
                    <MenuLink icon={Shield} href={ROUTES.ADMIN.ROOT} sheet>
                      {tNav("adminPanel")}
                    </MenuLink>
                  )}
                  <MenuButton icon={UserCircle} onClick={() => openProfile("info")} sheet>
                    {t("viewProfile")}
                  </MenuButton>
                  <MenuButton icon={History} onClick={() => openProfile("sessions")} sheet>
                    {t("sessionsMenuItem")}
                  </MenuButton>
                  <MenuButton icon={Info} onClick={() => openProfile("application")} sheet>
                    {t("applicationMenuItem")}
                  </MenuButton>
                  <MenuButton icon={LogOut} onClick={handleLogout} danger sheet>
                    {t("logout")}
                  </MenuButton>
                </div>
              </>
            )}

            {sheetView === "info" && profileContent}
            {sheetView === "sessions" &&
              (loadingProfile && !profileDetails ? (
                <div className="flex h-24 items-center justify-center">
                  <div className="border-primary h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
                </div>
              ) : (
                sessionsContent
              ))}
            {sheetView === "application" && applicationContent}
          </div>
        </BottomSheetPanel>
      )}

      {!isMobile && (
        <Modal
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          title={t("profileTitle")}
          size="md"
        >
          <ModalBody className="flex flex-col gap-3 pt-0">
            <Tabs
              items={[
                { key: "info", label: t("profileInfoTab") },
                { key: "sessions", label: t("sessionsTab") },
                { key: "application", label: t("applicationTab") },
              ]}
              active={activeTab}
              onChange={(key) => {
                setActiveTab(key as ProfileTab);
                if (key === "sessions" && !profileDetails) void fetchProfile();
              }}
            />

            {activeTab !== "application" && loadingProfile && !profileDetails ? (
              <div className="flex h-24 items-center justify-center">
                <div className="border-primary h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
              </div>
            ) : activeTab === "info" ? (
              profileContent
            ) : activeTab === "sessions" ? (
              sessionsContent
            ) : (
              applicationContent
            )}
          </ModalBody>
        </Modal>
      )}
    </>
  );
}

function ProfileMenuHeader({
  fullName,
  role,
  compact,
}: {
  fullName: string | null | undefined;
  role: string | null | undefined;
  compact?: boolean;
}) {
  const t = useTranslations("auth");

  return (
    <div
      className={cn(
        "gap-atom-md border-border flex items-center border-b",
        compact ? "pb-4" : "p-pad-mol",
      )}
    >
      <div className="bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-full">
        <UserCircle className="text-primary size-6" />
      </div>
      <div className="gap-pad-atom-xs flex min-w-0 flex-col">
        <span className="text-foreground truncate text-sm font-semibold">{fullName}</span>
        {role && role !== "client" && (
          <span className="text-muted text-xs">
            {role === "manager" ? t("roleManager") : t("roleAdmin")}
          </span>
        )}
      </div>
    </div>
  );
}

function MenuButton({
  icon: Icon,
  children,
  onClick,
  danger,
  sheet,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  sheet?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "gap-atom-md flex items-center text-right text-sm transition-colors",
        sheet ? "rounded-2xl px-4 py-3.5" : "px-pad-atom-md py-atom-md rounded-lg",
        danger ? "text-danger hover:bg-danger/5" : "text-foreground hover:bg-surface-2",
      )}
    >
      <Icon className={cn("size-4 shrink-0", !danger && "text-muted")} />
      {children}
    </button>
  );
}

function MenuLink({
  icon: Icon,
  children,
  href,
  sheet,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  href: string;
  sheet?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "gap-atom-md flex items-center text-right text-sm transition-colors",
        sheet ? "rounded-2xl px-4 py-3.5" : "px-pad-atom-md py-atom-md rounded-lg",
        "text-foreground hover:bg-surface-2",
      )}
    >
      <Icon className="text-muted size-4 shrink-0" />
      {children}
    </Link>
  );
}

function ProfileInfoTab({
  fullName,
  mobile,
  email,
  birthDate,
  nationalId,
  inviteCode,
  role,
}: {
  fullName: string | null | undefined;
  mobile?: string | null;
  email?: string | null;
  birthDate?: string | null;
  nationalId?: string | null;
  inviteCode?: string | null;
  role?: string | null;
}) {
  const t = useTranslations("auth");
  const panelProfileUrl = getPanelProfileUrl();

  const fields = [
    { label: t("profileFullName"), value: fullName ?? "" },
    { label: t("profileMobile"), value: mobile ?? "", dir: "ltr" as const },
    { label: t("profileEmail"), value: email ?? "", dir: "ltr" as const },
    {
      label: t("profileBirthDate"),
      value: birthDate ? formatDisplayDate(birthDate) : "",
      dir: "ltr" as const,
    },
    { label: t("profileNationalId"), value: nationalId ?? "", dir: "ltr" as const },
    { label: t("profileInviteCode"), value: inviteCode ?? "", dir: "ltr" as const },
    ...(role && role !== "client"
      ? [
          {
            label: t("profileRole"),
            value: role === "manager" ? t("roleManager") : t("roleAdmin"),
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-3">
      <dl className="divide-border/70 border-border/60 divide-y rounded-xl border">
        {fields.map((field) => (
          <ProfileField key={field.label} {...field} />
        ))}
      </dl>

      <div className="bg-surface-2/50 border-border/60 flex flex-col gap-2.5 rounded-xl border px-3 py-3">
        <p className="text-muted text-xs leading-relaxed">{t("profileEditOnNibMarketDesc")}</p>
        {panelProfileUrl ? (
          <a
            href={panelProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary hover:bg-primary-600 flex h-9 items-center justify-center gap-1.5 rounded-lg text-xs font-semibold text-white transition-colors"
          >
            <Link2 className="size-3.5" />
            {t("profileGoToNibMarket")}
            <ExternalLink className="size-3 opacity-70" />
          </a>
        ) : null}
      </div>
    </div>
  );
}

function ProfileField({
  label,
  value,
  dir,
}: {
  label: string;
  value: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 px-3 py-2">
      <dt className="text-muted shrink-0 text-[11px]">{label}</dt>
      <dd className="text-foreground min-w-0 truncate text-end text-xs font-medium" dir={dir}>
        {value || "—"}
      </dd>
    </div>
  );
}

function ApplicationInfoTab() {
  const t = useTranslations("auth");
  const environment =
    process.env.NEXT_PUBLIC_APP_ENV === "production"
      ? t("applicationEnvironmentProduction")
      : t("applicationEnvironmentDevelopment");

  const fields = [
    { label: t("applicationName"), value: t("applicationNameValue") },
    { label: t("applicationVersion"), value: displayVersion, dir: "ltr" as const },
    { label: t("applicationPlatform"), value: t("applicationPlatformValue") },
    { label: t("applicationEnvironment"), value: environment },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="border-primary/15 bg-primary/5 flex items-center gap-3 rounded-xl border p-3">
        <div className="bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-xl">
          <MonitorSmartphone className="text-primary size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-foreground text-sm font-medium">{t("applicationNameValue")}</p>
          <p className="text-muted mt-0.5 text-[11px]">{t("applicationDescription")}</p>
        </div>
      </div>

      <dl className="divide-border/70 border-border/60 divide-y rounded-xl border">
        {fields.map((field) => (
          <ProfileField key={field.label} {...field} />
        ))}
      </dl>

      <div className="text-success bg-success/5 border-success/15 flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs">
        <BadgeCheck className="size-4 shrink-0" />
        <span>{t("applicationUpToDate")}</span>
      </div>
    </div>
  );
}

function SessionsTab({ recentSessions }: { recentSessions: LoginActivity[] }) {
  const t = useTranslations("auth");

  if (recentSessions.length === 0) {
    return <p className="text-muted py-4 text-center text-xs">{t("noSessions")}</p>;
  }

  return (
    <ul className="divide-border/70 border-border/60 max-h-[min(60vh,20rem)] divide-y overflow-y-auto rounded-xl border">
      {recentSessions.map((s) => (
        <li key={s.id} className="flex items-center gap-2.5 px-3 py-2">
          <span
            className={cn(
              "size-1.5 shrink-0 rounded-full",
              s.status === "success" ? "bg-success" : "bg-danger",
            )}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p className="text-foreground text-xs font-medium tabular-nums" dir="ltr">
              {s.ip}
            </p>
            <p className="text-muted text-[11px] tabular-nums">
              {formatDisplayDateTime(s.createdAt)}
            </p>
          </div>
          <span
            className={cn(
              "shrink-0 text-[10px] font-medium",
              s.status === "success" ? "text-success" : "text-danger",
            )}
          >
            {s.status === "success" ? t("sessionSuccess") : t("sessionFailed")}
          </span>
        </li>
      ))}
    </ul>
  );
}

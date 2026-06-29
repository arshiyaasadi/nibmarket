/**
 * @level organism
 * @spacing internal: gap-atom-md (items), p-pad-mol (sections) | external: none
 */
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  LogOut, UserCircle, CheckCircle, XCircle, History, Pencil, X, Check, Link2,
} from "lucide-react";
import { Alert, Button, Input, Modal, ModalBody, Tabs } from "@/components/atoms";
import { ThemeToggle } from "./ThemeToggle";
import { performLogout } from "@/lib/auth/session";
import { BFF_API_BASE } from "@/lib/api/endpoints";
import { useSession } from "@/hooks/use-session";
import { cn } from "@/lib/utils";
import { normalizeSearchInput } from "@/lib/normalization/digits";
import type { LoginActivity } from "@/types/mlm";

type ProfileDetails = {
  fullName: string;
  mobile: string;
  email: string;
  birthDate: string | null;
  nationalId: string | null;
  nibMarketLinked: boolean;
  recentSessions: LoginActivity[];
};

export function ProfileDropdown() {
  const t = useTranslations("auth");
  const router = useRouter();
  const { fullName, role } = useSession();

  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "sessions">("info");
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
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpen(true), 120);
  }

  function onLeave() {
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

  function openProfile(tab: "info" | "sessions" = "info") {
    setOpen(false);
    setActiveTab(tab);
    setProfileOpen(true);
    void fetchProfile();
  }

  async function handleLogout() {
    await performLogout();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <div
        ref={ref}
        className="relative"
        dir="rtl"
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        <button
          type="button"
          aria-label={t("viewProfile")}
          onClick={() => openProfile("info")}
          className="flex items-center justify-center rounded-lg p-pad-atom text-muted hover:bg-surface-2 hover:text-foreground transition-colors"
        >
          <UserCircle className="size-6" />
        </button>

        {open && (
          <div className="absolute end-0 top-full mt-atom-md z-50 w-72 rounded-xl border border-border bg-surface shadow-lg overflow-hidden">
            <div className="flex items-center gap-atom-md p-pad-mol border-b border-border">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <UserCircle className="size-6 text-primary" />
              </div>
              <div className="flex min-w-0 flex-col gap-pad-atom-xs">
                <span className="truncate text-sm font-semibold text-foreground">{fullName}</span>
                {role && role !== "client" && (
                  <span className="text-xs text-muted">
                    {role === "manager" ? t("roleManager") : t("roleAdmin")}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between px-pad-mol py-pad-atom-md border-b border-border">
              <span className="text-xs text-muted">{t("theme")}</span>
              <ThemeToggle />
            </div>

            <div className="flex flex-col p-pad-atom-md">
              <button
                type="button"
                onClick={() => openProfile("info")}
                className="flex items-center gap-atom-md rounded-lg px-pad-atom-md py-atom-md text-sm text-foreground hover:bg-surface-2 transition-colors text-right"
              >
                <UserCircle className="size-4 shrink-0 text-muted" />
                {t("viewProfile")}
              </button>
              <button
                type="button"
                onClick={() => openProfile("sessions")}
                className="flex items-center gap-atom-md rounded-lg px-pad-atom-md py-atom-md text-sm text-foreground hover:bg-surface-2 transition-colors text-right"
              >
                <History className="size-4 shrink-0 text-muted" />
                {t("sessionsMenuItem")}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-atom-md rounded-lg px-pad-atom-md py-atom-md text-sm text-danger hover:bg-danger/5 transition-colors text-right"
              >
                <LogOut className="size-4 shrink-0" />
                {t("logout")}
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        title={t("profileTitle")}
        size="md"
      >
        <ModalBody className="flex flex-col gap-4 pt-0">
          <Tabs
            items={[
              { key: "info", label: t("profileInfoTab") },
              { key: "sessions", label: t("sessionsTab") },
            ]}
            active={activeTab}
            onChange={(key) => setActiveTab(key as "info" | "sessions")}
          />

          {loadingProfile && !profileDetails ? (
            <div className="flex h-24 items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : activeTab === "info" ? (
            <ProfileInfoTab
              fullName={profileDetails?.fullName ?? fullName}
              mobile={profileDetails?.mobile}
              email={profileDetails?.email}
              birthDate={profileDetails?.birthDate}
              nationalId={profileDetails?.nationalId}
              nibMarketLinked={profileDetails?.nibMarketLinked ?? false}
            />
          ) : (
            <SessionsTab recentSessions={profileDetails?.recentSessions ?? []} />
          )}
        </ModalBody>
      </Modal>
    </>
  );
}

function ProfileInfoTab({
  fullName,
  mobile,
  email,
  birthDate,
  nationalId,
  nibMarketLinked,
}: {
  fullName: string | null | undefined;
  mobile?: string | null;
  email?: string | null;
  birthDate?: string | null;
  nationalId?: string | null;
  nibMarketLinked: boolean;
}) {
  const t = useTranslations("auth");
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(fullName ?? "");
  const [draftBirth, setDraftBirth] = useState(birthDate ?? "");
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleCancel() {
    setDraftName(fullName ?? "");
    setDraftBirth(birthDate ?? "");
    setEditing(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        {!editing ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            startIcon={<Pencil className="size-3.5" />}
            onClick={() => {
              setDraftName(fullName ?? "");
              setDraftBirth(birthDate ?? "");
              setEditing(true);
            }}
          >
            {t("profileEditButton")}
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              startIcon={<X className="size-3.5" />}
              onClick={handleCancel}
            >
              {t("profileCancelButton")}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              startIcon={<Check className="size-3.5" />}
              onClick={handleSave}
            >
              {t("profileSaveButton")}
            </Button>
          </div>
        )}
      </div>

      {saved && (
        <Alert variant="success">{t("profileSaved")}</Alert>
      )}

      <div className="flex flex-col gap-3">
        <Input
          label={t("profileFullName")}
          value={editing ? draftName : (fullName ?? "")}
          onChange={(e) => setDraftName(e.target.value)}
          disabled={!editing}
        />
        <Input
          label={t("profileMobile")}
          value={mobile ?? ""}
          disabled
          dir="ltr"
        />
        <Input
          label={t("profileEmail")}
          value={email ?? ""}
          disabled
          dir="ltr"
        />
        <Input
          label={t("profileBirthDate")}
          value={editing ? draftBirth : (birthDate || "—")}
          onChange={(e) => setDraftBirth(normalizeSearchInput(e.target.value))}
          disabled={!editing}
          dir="ltr"
        />
        <Input
          label={t("profileNationalId")}
          value={nationalId || "—"}
          disabled
          dir="ltr"
          hint={nationalId ? t("profileNationalIdLocked") : undefined}
        />
      </div>

      {!nibMarketLinked && (
        <div className="flex flex-col gap-3 border-t border-border pt-4">
          <Alert variant="info" title={t("profileCompleteTitle")}>
            {t("profileCompleteDesc")}
          </Alert>
          <Button type="button" fullWidth startIcon={<Link2 className="size-4" />}>
            {t("profileConnectNibMarket")}
          </Button>
        </div>
      )}
    </div>
  );
}

function SessionsTab({ recentSessions }: { recentSessions: LoginActivity[] }) {
  const t = useTranslations("auth");

  if (recentSessions.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted">{t("noSessions")}</p>
    );
  }

  return (
    <ul className="max-h-72 divide-y divide-border overflow-y-auto">
      {recentSessions.map((s) => (
        <li key={s.id} className="flex items-start gap-3 py-3">
          {s.status === "success"
            ? <CheckCircle className="mt-0.5 size-4 shrink-0 text-success" />
            : <XCircle className="mt-0.5 size-4 shrink-0 text-danger" />
          }
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">{s.device}</p>
            <p className="text-xs text-muted" dir="ltr">{s.ip}</p>
            <p className="text-xs text-muted">{s.createdAt}</p>
          </div>
          <span className={cn(
            "shrink-0 text-xs",
            s.status === "success" ? "text-success" : "text-danger",
          )}>
            {s.status === "success" ? "موفق" : "ناموفق"}
          </span>
        </li>
      ))}
    </ul>
  );
}

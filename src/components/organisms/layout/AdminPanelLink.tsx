/**
 * @level molecule
 * Minimal switch back to the admin panel — only rendered for admin/manager roles.
 */
"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Shield } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { isAdminRole } from "@/config/roles";
import { useUserRole } from "@/store/hooks/use-auth";

export function AdminPanelLink() {
  const t = useTranslations("nav");
  const role = useUserRole();

  // UI_DEV_MODE has no session, so keep the switch reachable while developing.
  const isUiDevMode = process.env.NEXT_PUBLIC_UI_DEV_MODE === "1";
  if (!isUiDevMode && (!role || !isAdminRole(role))) return null;

  return (
    <Link
      href={ROUTES.ADMIN.ROOT}
      aria-label={t("adminPanel")}
      title={t("adminPanel")}
      data-tour="panel-back-to-admin"
      className="border-primary/30 text-primary hover:bg-primary/10 flex size-9 shrink-0 items-center justify-center rounded-xl border transition-colors"
    >
      <Shield className="size-4" />
    </Link>
  );
}

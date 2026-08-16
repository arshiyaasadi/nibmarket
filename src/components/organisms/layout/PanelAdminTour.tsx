"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { PANEL_FROM_ADMIN_QUERY, TOUR_KEYS } from "@/config/onboarding";
import { useOnboardingTour } from "@/hooks/use-onboarding-tour";
import { isAdminRole } from "@/config/roles";
import { useUserRole } from "@/store/hooks/use-auth";

/** Single-step hint shown once when an admin lands on the client panel. */
export function PanelAdminTour() {
  const t = useTranslations("tour.panel");
  const searchParams = useSearchParams();
  const role = useUserRole();

  const cameFromAdmin = searchParams.get(PANEL_FROM_ADMIN_QUERY) === "1";
  const isAdmin = process.env.NEXT_PUBLIC_UI_DEV_MODE === "1" || (role ? isAdminRole(role) : false);

  useOnboardingTour(
    TOUR_KEYS.PANEL_BACK_TO_ADMIN,
    [
      {
        target: "panel-back-to-admin",
        title: t("backToAdminTitle"),
        description: t("backToAdminDescription"),
      },
    ],
    cameFromAdmin && isAdmin,
  );

  return null;
}

"use client";

import { useTranslations } from "next-intl";
import { TOUR_KEYS } from "@/config/onboarding";
import { useOnboardingTour } from "@/hooks/use-onboarding-tour";

/** One-time walkthrough of the admin header, shown on the first admin dashboard visit. */
export function AdminDashboardTour() {
  const t = useTranslations("tour.admin");

  useOnboardingTour(TOUR_KEYS.ADMIN_DASHBOARD, [
    {
      target: "admin-client-panel",
      title: t("clientPanelTitle"),
      description: t("clientPanelDescription"),
    },
    {
      target: "admin-notifications",
      title: t("notificationsTitle"),
      description: t("notificationsDescription"),
    },
  ]);

  return null;
}

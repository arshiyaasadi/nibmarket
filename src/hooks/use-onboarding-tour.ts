"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { startTourOnce, type TourStep } from "@/lib/onboarding/tour";

/**
 * Shows a one-time guided tour after the target elements are mounted.
 * Pass `enabled: false` to hold the tour back until its trigger is met.
 */
export function useOnboardingTour(tourKey: string, steps: TourStep[], enabled = true): void {
  const t = useTranslations("tour");
  const stepsSignature = JSON.stringify(steps);

  useEffect(() => {
    if (!enabled) return;

    const labels = { next: t("next"), previous: t("previous"), done: t("done") };
    // Wait a frame so freshly navigated pages have painted their targets.
    const timer = window.setTimeout(() => {
      startTourOnce(tourKey, JSON.parse(stepsSignature) as TourStep[], labels);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [enabled, stepsSignature, t, tourKey]);
}

/**
 * Thin wrapper around driver.js for RTL, one-time product tours.
 * Each tour is identified by a key so it is shown once per browser.
 */
import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";

const SEEN_KEY_PREFIX = "nib-tour-seen:";

export type TourStep = {
  /** Value of the `data-tour` attribute on the target element. */
  target: string;
  title: string;
  description: string;
};

export type TourLabels = {
  next: string;
  previous: string;
  done: string;
};

export function hasSeenTour(tourKey: string): boolean {
  try {
    return localStorage.getItem(`${SEEN_KEY_PREFIX}${tourKey}`) === "1";
  } catch {
    return true;
  }
}

export function markTourAsSeen(tourKey: string): void {
  try {
    localStorage.setItem(`${SEEN_KEY_PREFIX}${tourKey}`, "1");
  } catch {
    // storage unavailable (private mode) — tour simply repeats next time
  }
}

function resolveSteps(steps: TourStep[]): DriveStep[] {
  return steps
    .filter((step) => document.querySelector(`[data-tour="${step.target}"]`))
    .map((step) => ({
      element: `[data-tour="${step.target}"]`,
      popover: { title: step.title, description: step.description },
    }));
}

/** Runs a tour once per browser. Returns true when it actually started. */
export function startTourOnce(tourKey: string, steps: TourStep[], labels: TourLabels): boolean {
  if (hasSeenTour(tourKey)) return false;

  const resolved = resolveSteps(steps);
  if (resolved.length === 0) return false;

  markTourAsSeen(tourKey);

  driver({
    showProgress: resolved.length > 1,
    allowClose: true,
    overlayOpacity: 0.6,
    stagePadding: 6,
    stageRadius: 12,
    popoverClass: "nib-tour",
    nextBtnText: labels.next,
    prevBtnText: labels.previous,
    doneBtnText: labels.done,
    steps: resolved,
  }).drive();

  return true;
}

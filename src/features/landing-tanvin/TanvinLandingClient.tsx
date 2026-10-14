"use client";

import { useEffect, useRef } from "react";
import { startAuthEntry } from "@/config/auth-redirect";
import { ROUTES } from "@/config/routes";
import { TANVIN_LANDING_MARKUP } from "./markup";
import { initTanvinLanding } from "./initTanvinLanding";
import "./tanvin-landing.css";

/**
 * New Tanvin marketing landing — styles scoped to `.tanvin-landing` only.
 * Does not affect panel/admin theme tokens.
 */
export function TanvinLandingClient() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    root.innerHTML = TANVIN_LANDING_MARKUP;

    const cleanup = initTanvinLanding(root, () => {
      startAuthEntry(ROUTES.DASHBOARD);
    });

    return () => {
      cleanup();
      root.innerHTML = "";
    };
  }, []);

  return (
    <div ref={rootRef} className="tanvin-landing" dir="rtl" lang="fa" suppressHydrationWarning />
  );
}

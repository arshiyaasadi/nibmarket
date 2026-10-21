/**
 * `/landing-legacy` is rewritten by proxy.ts to `public/landing-v1/index.html`
 * (exact previous landing-1). This route is only a build/type fallback.
 */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "تنوین · شبکه بازاریابان نوین (نسخه قبلی)",
  description: "نسخه قبلی لندینگ تنوین (landing-1) — لندینگ اصلی الان landing-2 روی مسیر خانه است.",
};

export default function LandingLegacyFallback() {
  return null;
}

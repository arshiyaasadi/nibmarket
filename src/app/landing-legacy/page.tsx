import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "تنوین · شبکه بازاریابان نوین (نسخه قبلی)",
  description: "نسخه قبلی لندینگ تنوین (landing-1).",
};

/** Fallback if rewrite misses — previous landing-1 static. */
export default function LandingLegacyFallback() {
  redirect("/landing-v1/index.html");
}

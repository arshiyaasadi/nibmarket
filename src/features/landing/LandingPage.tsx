import type { Metadata } from "next";
import { TanvinLandingClient } from "@/features/landing-tanvin/TanvinLandingClient";

export const metadata: Metadata = {
  title: "تنوین · شبکه بازاریابان نوین",
  description:
    "تنوین، طرح همکاری شبکه بازاریابان تأمین سرمایه نوین؛ سرمایه‌گذار معرفی کنید و هر روز سهم خود را به‌صورت سکه نقره تنوین دریافت کنید.",
};

/** Active home landing (new Tanvin static design). Legacy kept at LegacyLandingPage. */
export default function LandingPage() {
  return <TanvinLandingClient />;
}

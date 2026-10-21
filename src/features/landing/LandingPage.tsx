import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "تنوین · شبکه بازاریابان نوین",
  description:
    "تنوین، طرح همکاری شبکه بازاریابان تأمین سرمایه نوین؛ سرمایه‌گذار معرفی کنید و هر روز سهم خود را به‌صورت سکه نقره تنوین دریافت کنید.",
};

/** Alias of home fallback — exact landing is `public/landing-v2`. */
export default function LandingPage() {
  redirect("/landing-v2/index.html");
}

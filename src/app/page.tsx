import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "تنوین · شبکه بازاریابان نوین",
  description:
    "تنوین، طرح همکاری شبکه بازاریابان تأمین سرمایه نوین؛ سرمایه‌گذار معرفی کنید و هر روز سهم خود را به‌صورت سکه نقره تنوین دریافت کنید.",
};

/**
 * Home is served as exact landing-2 via next.config `beforeFiles` + proxy rewrite.
 * This redirect is a hard fallback if those rewrites ever miss in a given runtime.
 */
export default function HomeFallback() {
  redirect("/landing-v2/index.html");
}

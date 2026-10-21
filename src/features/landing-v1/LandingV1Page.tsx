import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { LandingV1Client } from "@/features/landing-v1/LandingV1Client";

export const metadata: Metadata = {
  title: "تنوین · شبکه بازاریابان نوین",
  description:
    "تنوین، طرح همکاری شبکه بازاریابان تأمین سرمایه نوین؛ سرمایه‌گذار معرفی کنید و هر روز سهم خود را به‌صورت سکه نقره تنوین دریافت کنید.",
};

function readLandingBody(): string {
  const file = path.join(process.cwd(), "src/features/landing-v1/landing-v1-body.html");
  return fs.readFileSync(file, "utf8");
}

/** Home landing — exact landing-1 markup, styles, and script. */
export default function LandingV1Page() {
  const html = readLandingBody();
  return <LandingV1Client html={html} />;
}

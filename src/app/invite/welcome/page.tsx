import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { InviteWelcomeClient } from "./InviteWelcomeClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("invite");
  return { title: t("successTitle") };
}

export default function InviteWelcomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4" dir="rtl">
      <div className="w-full max-w-md rounded-2xl bg-surface p-pad-mol-md shadow-lg">
        <Suspense>
          <InviteWelcomeClient />
        </Suspense>
      </div>
    </div>
  );
}

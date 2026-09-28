import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LogoutIncompleteClient } from "./LogoutIncompleteClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: t("logoutIncompleteTitle") };
}

export default async function LogoutIncompletePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4" dir="rtl">
      <div className="w-full max-w-md rounded-2xl bg-surface p-pad-mol-md shadow-lg">
        <Suspense>
          <LogoutIncompleteClient />
        </Suspense>
      </div>
    </div>
  );
}

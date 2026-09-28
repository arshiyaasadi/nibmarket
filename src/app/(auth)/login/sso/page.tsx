import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { SsoCallbackClient } from "./SsoCallbackClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: t("ssoCallbackTitle") };
}

export default async function SsoCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8" dir="rtl">
      <div className="w-full max-w-md rounded-2xl bg-surface p-pad-mol-md shadow-lg">
        <Suspense>
          <SsoCallbackClient />
        </Suspense>
      </div>
    </div>
  );
}

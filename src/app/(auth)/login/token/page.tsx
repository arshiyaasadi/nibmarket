import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { TokenLoginClient } from "./TokenLoginClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: t("ssoManualTitle") };
}

export default async function TokenLoginPage() {
  const t = await getTranslations("auth");
  return (
    <div className="flex min-h-screen items-center justify-center bg-background" dir="rtl">
      <div className="w-full max-w-md rounded-2xl bg-surface p-pad-mol-md shadow-lg">
        <h1 className="mb-pad-mol-md text-center text-2xl font-bold text-foreground">
          {t("ssoManualTitle")}
        </h1>
        <Suspense>
          <TokenLoginClient />
        </Suspense>
      </div>
    </div>
  );
}

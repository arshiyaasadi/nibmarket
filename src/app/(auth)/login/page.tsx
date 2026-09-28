import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LoginEntryClient } from "./LoginEntryClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: t("login") };
}

export default async function LoginPage() {
  const t = await getTranslations("auth");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background" dir="rtl">
      <div className="w-full max-w-md rounded-2xl bg-surface p-pad-mol-md shadow-lg">
        <h1 className="mb-pad-mol-md text-center text-2xl font-bold text-foreground">
          {t("login")}
        </h1>
        <Suspense>
          <LoginEntryClient />
        </Suspense>
      </div>
    </div>
  );
}

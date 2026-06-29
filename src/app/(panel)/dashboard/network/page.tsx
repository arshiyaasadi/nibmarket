import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { NetworkPageClient } from "./NetworkPageClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages");
  return { title: t("network.subsetsTitle") };
}

export default async function Page() {
  return (
    <Suspense fallback={
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    }>
      <NetworkPageClient />
    </Suspense>
  );
}

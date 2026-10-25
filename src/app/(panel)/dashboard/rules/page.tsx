import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { RulesPageClient } from "./RulesPageClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages.rules");
  return { title: t("title") };
}

export default async function Page() {
  return (
    <div className="gap-mol flex flex-col">
      <Suspense>
        <RulesPageClient />
      </Suspense>
    </div>
  );
}

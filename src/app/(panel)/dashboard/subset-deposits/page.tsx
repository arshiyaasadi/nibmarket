import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { SubsetDepositsContent } from "./SubsetDepositsContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("subsetDeposits");
  return { title: t("title") };
}

export default async function Page() {
  return (
    <div className="flex flex-col gap-6">
      <Suspense>
        <SubsetDepositsContent />
      </Suspense>
    </div>
  );
}

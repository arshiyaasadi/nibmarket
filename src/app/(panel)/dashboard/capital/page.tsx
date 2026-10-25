import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { RulesGuidelineTabs } from "@/components/molecules/RulesGuidelineTabs";
import { DepositRulesContent } from "./DepositRulesContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("depositRules");
  return { title: t("title") };
}

export default async function Page() {
  return (
    <div className="gap-org flex flex-col">
      <RulesGuidelineTabs active="deposit" />
      <DepositRulesContent />
    </div>
  );
}

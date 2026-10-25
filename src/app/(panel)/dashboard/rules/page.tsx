import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { RulesGuidelineTabs } from "@/components/molecules/RulesGuidelineTabs";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("depositRules");
  return { title: t("networkTitle") };
}

export default async function Page() {
  const tCommon = await getTranslations("common");
  const t = await getTranslations("depositRules");

  return (
    <div className="gap-org flex flex-col">
      <RulesGuidelineTabs active="network" />
      <section className="gap-atom-md flex max-w-3xl flex-col">
        <h1 className="text-foreground text-3xl leading-snug font-black">{t("networkTitle")}</h1>
      </section>
      <div className="border-border text-muted p-pad-org flex items-center justify-center rounded-2xl border text-sm">
        {tCommon("comingSoon")}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MissionsContent } from "./MissionsContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("missions");
  return { title: t("title") };
}

export default async function Page() {
  const t = await getTranslations("missions");
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-foreground">{t("title")}</h1>
      <MissionsContent />
    </div>
  );
}

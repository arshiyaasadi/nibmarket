import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MissionsContent } from "./MissionsContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("missions");
  return { title: t("title") };
}

export default async function Page() {
  return (
    <div className="flex flex-col gap-6">
      <MissionsContent />
    </div>
  );
}

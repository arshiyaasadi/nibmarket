import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages");
  return { title: t("reports.subsetsTitle") };
}

export default async function Page() {
  const tCommon = await getTranslations("common");
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center rounded-lg border p-12 text-sm text-gray-400">
        {tCommon("comingSoon")}
      </div>
    </div>
  );
}

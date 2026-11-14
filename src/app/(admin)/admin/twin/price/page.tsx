import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ROUTES } from "@/config/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.twin");
  return { title: t("priceComingSoonTitle") };
}

export default async function AdminTwinPriceComingSoonPage() {
  const t = await getTranslations("admin.twin");

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <h1 className="text-foreground text-xl font-bold">{t("priceComingSoonTitle")}</h1>
      <p className="text-muted max-w-md text-sm">{t("priceComingSoonBody")}</p>
      <Link
        href={ROUTES.ADMIN.TWIN}
        className="bg-primary text-primary-foreground mt-2 rounded-xl px-4 py-2 text-sm font-medium"
      >
        {t("backToTwin")}
      </Link>
    </div>
  );
}

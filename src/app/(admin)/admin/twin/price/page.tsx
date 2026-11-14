import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import PricePageContent from "./PricePageContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.twin");
  return { title: t("priceTitle") };
}

export default function AdminTwinPricePage() {
  return <PricePageContent />;
}

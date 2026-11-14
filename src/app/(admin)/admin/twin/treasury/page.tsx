import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import TreasuryPageContent from "./TreasuryPageContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.twin");
  return { title: `${t("treasuryTitle")} — مدیریت` };
}

export default function TwinTreasuryPage() {
  return <TreasuryPageContent />;
}

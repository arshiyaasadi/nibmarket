import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import NetworkPageContent from "./NetworkPageContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.network");
  return { title: `${t("title")} — مدیریت` };
}

export default function NetworkPage() {
  return <NetworkPageContent />;
}

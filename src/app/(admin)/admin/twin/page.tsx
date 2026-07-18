import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import TwinPageContent from "./TwinPageContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.twin");
  return { title: `${t("title")} — مدیریت` };
}

export default function TwinPage() {
  return <TwinPageContent />;
}

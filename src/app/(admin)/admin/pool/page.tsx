import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import PoolPageContent from "./PoolPageContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.pool");
  return { title: `${t("title")} — مدیریت` };
}

export default function PoolPage() {
  return <PoolPageContent />;
}

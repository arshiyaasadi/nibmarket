import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MessagesPageContent } from "./MessagesPageContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.systemMessages");
  return { title: t("title") };
}

export default function AdminUserMessagesPage() {
  return <MessagesPageContent />;
}

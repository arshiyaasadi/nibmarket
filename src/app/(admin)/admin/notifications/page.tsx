import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NotificationsPageContent } from "./NotificationsPageContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.notifications");
  return { title: t("title") };
}

export default function AdminNotificationsPage() {
  return <NotificationsPageContent />;
}

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NotificationsPageContent } from "./NotificationsPageContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages");
  return { title: t("notifications.title") };
}

export default function NotificationsPage() {
  return <NotificationsPageContent />;
}

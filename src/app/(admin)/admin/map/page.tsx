import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { UserMapContent } from "./UserMapContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.userMap");
  return { title: t("title") };
}

export default function AdminUserMapPage() {
  return (
    <Suspense fallback={<div className="bg-surface-2 h-[42rem] w-full animate-pulse rounded-2xl" />}>
      <UserMapContent />
    </Suspense>
  );
}

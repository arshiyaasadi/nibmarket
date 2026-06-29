import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { LeaderboardClient } from "./LeaderboardClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages");
  return { title: t("leaderboard.pool") };
}

export default async function Page() {
  const t = await getTranslations("pages");
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-foreground">{t("leaderboard.pool")}</h1>
      <Suspense fallback={
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }>
        <LeaderboardClient />
      </Suspense>
    </div>
  );
}

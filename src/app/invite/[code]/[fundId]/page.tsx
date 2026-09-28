import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { InviteEntryClient } from "../InviteEntryClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("invite");
  return { title: t("redirectTitle") };
}

export default function InviteEntryWithFundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4" dir="rtl">
      <div className="w-full max-w-md rounded-2xl bg-surface p-pad-mol-md shadow-lg">
        <InviteEntryClient />
      </div>
    </div>
  );
}

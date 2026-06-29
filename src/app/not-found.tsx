import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ROUTES } from "@/config/routes";

export default async function NotFound() {
  const t = await getTranslations("errors");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4" dir="rtl">
      <h1 className="text-4xl font-bold">۴۰۴</h1>
      <p className="text-gray-500">{t("notFound")}</p>
      <Link href={ROUTES.DASHBOARD} className="text-sm underline">
        {t("goHome")}
      </Link>
    </div>
  );
}

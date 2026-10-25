/**
 * @level organism
 * @spacing internal: gap-mol gap-org | external: none
 */
"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Tabs } from "@/components/atoms/Tabs";
import { GuidelinesAccordion } from "@/components/molecules/GuidelinesAccordion";
import {
  GUIDELINE_CATEGORIES,
  getGuidelinesByCategory,
  isGuidelineCategoryId,
  type GuidelineCategoryId,
  type GuidelineId,
} from "@/features/guidelines";
import { ROUTES } from "@/config/routes";

const DEFAULT_TAB: GuidelineCategoryId = "deposit";

function resolveTab(value: string | null): GuidelineCategoryId {
  if (value && isGuidelineCategoryId(value)) return value;
  return DEFAULT_TAB;
}

function resolveQuestion(
  value: string | null,
  categoryId: GuidelineCategoryId,
): GuidelineId | undefined {
  if (!value) return undefined;
  const items = getGuidelinesByCategory(categoryId);
  const match = items.find((item) => item.id === value);
  return match?.id;
}

export function RulesPageClient() {
  const t = useTranslations("pages.rules");
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTab = resolveTab(searchParams.get("tab"));
  const openQuestion = resolveQuestion(searchParams.get("q"), activeTab);
  const category = GUIDELINE_CATEGORIES.find((c) => c.id === activeTab)!;
  const items = useMemo(() => getGuidelinesByCategory(activeTab), [activeTab]);

  const setTab = useCallback(
    (key: string) => {
      if (!isGuidelineCategoryId(key)) return;
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", key);
      params.delete("q");
      router.replace(`${ROUTES.RULES}?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  return (
    <div className="gap-mol flex flex-col">
      <header className="gap-atom flex max-w-3xl flex-col">
        <h1 className="text-foreground text-lg font-bold sm:text-xl">{t("title")}</h1>
        <p className="text-muted text-sm leading-relaxed">{t("subtitle")}</p>
      </header>

      <Tabs
        variant="pills"
        active={activeTab}
        onChange={setTab}
        items={GUIDELINE_CATEGORIES.map((c) => ({
          key: c.id,
          label: c.label,
          count: getGuidelinesByCategory(c.id).length,
        }))}
      />

      <section className="gap-mol flex flex-col">
        <div className="gap-atom flex max-w-3xl flex-col">
          <h2 className="text-foreground text-sm font-bold">{category.label}</h2>
          <p className="text-muted text-sm leading-relaxed">{category.description}</p>
        </div>
        <GuidelinesAccordion
          key={activeTab}
          items={items}
          initialOpenId={openQuestion ?? items[0]?.id}
        />
      </section>

      <p className="text-muted text-xs leading-relaxed">{t("disclaimer")}</p>
    </div>
  );
}

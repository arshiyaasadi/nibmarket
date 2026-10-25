/**
 * @level molecule
 * @spacing internal: gap-atom-md | external: none
 */
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

type RulesTab = "deposit" | "network";

export async function RulesGuidelineTabs({ active }: { active: RulesTab }) {
  const t = await getTranslations("depositRules");
  const tNav = await getTranslations("nav");

  const tabs: { key: RulesTab; href: string; label: string }[] = [
    { key: "deposit", href: ROUTES.CAPITAL, label: t("title") },
    { key: "network", href: ROUTES.RULES, label: tNav("rulesNetwork") },
  ];

  return (
    <nav aria-label={tNav("rules")} className="border-border gap-atom-md flex flex-wrap border-b">
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "px-pad-mol py-pad-atom-md -mb-px text-sm font-bold no-underline transition-colors",
              isActive
                ? "border-primary text-primary border-b-[3px]"
                : "text-muted hover:text-foreground border-b-[3px] border-transparent",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

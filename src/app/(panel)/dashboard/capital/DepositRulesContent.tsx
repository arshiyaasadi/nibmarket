/**
 * @level organism
 * @spacing internal: gap-org gap-mol | external: none
 */
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";

const HIGHLIGHTS = [
  { valueKey: "highlights.daily", descKey: "highlights.dailyDesc" },
  { valueKey: "highlights.levels", descKey: "highlights.levelsDesc" },
  { valueKey: "highlights.uncapped", descKey: "highlights.uncappedDesc" },
  { valueKey: "highlights.silver", descKey: "highlights.silverDesc" },
] as const;

const LEVELS = [
  { rateKey: "formula.level1Rate", descKey: "formula.level1Desc" },
  { rateKey: "formula.level2Rate", descKey: "formula.level2Desc" },
  { rateKey: "formula.level3Rate", descKey: "formula.level3Desc" },
] as const;

const FLOW_STEPS = [
  {
    amountKey: "flow.bar100",
    heightClass: "h-[7.5rem]",
    titleKey: "flow.step1Title",
    descKey: "flow.step1Desc",
    empty: false,
  },
  {
    amountKey: "flow.bar150",
    heightClass: "h-[11.25rem]",
    titleKey: "flow.step2Title",
    descKey: "flow.step2Desc",
    empty: false,
  },
  {
    amountKey: "flow.bar100",
    heightClass: "h-[7.5rem]",
    titleKey: "flow.step3Title",
    descKey: "flow.step3Desc",
    empty: false,
  },
  {
    amountKey: "flow.barZero",
    heightClass: "h-1",
    titleKey: "flow.step4Title",
    descKey: "flow.step4Desc",
    empty: true,
  },
] as const;

const RULE_KEYS = [
  { title: "rules.r1Title", body: "rules.r1Body" },
  { title: "rules.r2Title", body: "rules.r2Body" },
  { title: "rules.r3Title", body: "rules.r3Body" },
  { title: "rules.r4Title", body: "rules.r4Body" },
  { title: "rules.r5Title", body: "rules.r5Body" },
  { title: "rules.r6Title", body: "rules.r6Body" },
] as const;

export async function DepositRulesContent() {
  const t = await getTranslations("depositRules");

  const formulaParts = [
    { key: "formula.deposit", primary: false },
    { key: "formula.rate", primary: false },
    { key: "formula.days", primary: false },
    { key: "formula.coinValue", primary: false },
  ] as const;
  const ops = ["=", "×", "÷", "÷"] as const;

  return (
    <div className="gap-org flex flex-col">
      <section className="gap-atom-md flex max-w-3xl flex-col">
        <h1 className="text-foreground text-3xl leading-snug font-black">{t("title")}</h1>
        <p className="text-muted text-base leading-relaxed sm:text-lg">{t("intro")}</p>
      </section>

      <section
        aria-label={t("title")}
        className="gap-mol grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
      >
        {HIGHLIGHTS.map((item) => (
          <div
            key={item.valueKey}
            className="border-border bg-surface gap-atom p-pad-mol flex flex-col rounded-2xl border"
          >
            <span className="text-primary text-2xl font-black">{t(item.valueKey)}</span>
            <span className="text-muted text-sm leading-relaxed">{t(item.descKey)}</span>
          </div>
        ))}
      </section>

      <section className="border-border bg-surface gap-stack-mol p-pad-mol-md flex flex-col rounded-2xl border">
        <div className="gap-atom flex flex-col">
          <h2 className="text-foreground text-xl font-extrabold">{t("formula.title")}</h2>
          <p className="text-muted text-sm leading-relaxed sm:text-base">{t("formula.lead")}</p>
        </div>

        <div className="gap-atom-md flex flex-wrap items-center text-sm font-bold sm:text-base">
          <span className="bg-primary px-pad-mol py-pad-atom-md rounded-xl text-white">
            {t("formula.result")}
          </span>
          {formulaParts.map((part, i) => (
            <span key={part.key} className="contents">
              <span aria-hidden className="text-muted">
                {ops[i]}
              </span>
              <span className="bg-primary/10 text-foreground px-pad-mol py-pad-atom-md rounded-xl">
                {t(part.key)}
              </span>
            </span>
          ))}
        </div>

        <div className="gap-mol grid grid-cols-1 md:grid-cols-3">
          {LEVELS.map((level) => (
            <div
              key={level.rateKey}
              className="border-border gap-atom p-pad-mol flex flex-col rounded-xl border"
            >
              <span className="text-primary text-xl font-black">{t(level.rateKey)}</span>
              <span className="text-muted text-sm leading-relaxed">{t(level.descKey)}</span>
            </div>
          ))}
        </div>

        <p className="bg-background px-pad-mol py-pad-atom-md rounded-xl text-sm leading-relaxed sm:text-base">
          <b>{t("formula.exampleLabel")}</b> {t("formula.example")}
        </p>
      </section>

      <section className="border-border bg-surface gap-stack-mol p-pad-mol-md flex flex-col rounded-2xl border">
        <div className="gap-atom flex flex-col">
          <h2 className="text-foreground text-xl font-extrabold">{t("flow.title")}</h2>
          <p className="text-muted text-sm leading-relaxed sm:text-base">{t("flow.lead")}</p>
        </div>

        <div
          role="img"
          aria-label={t("flow.chartAria")}
          className="border-border gap-atom-md px-atom-md grid h-[13.75rem] grid-cols-2 items-end border-b-2 sm:grid-cols-4"
        >
          {FLOW_STEPS.map((step) => (
            <div key={step.titleKey} className="gap-atom-md flex h-full flex-col justify-end">
              <span
                className={cn("text-center text-sm font-extrabold", step.empty && "text-muted")}
              >
                {t(step.amountKey)}
              </span>
              <div
                className={cn(
                  "w-full rounded-t-lg",
                  step.heightClass,
                  step.empty ? "bg-muted/40" : "bg-primary",
                )}
              />
            </div>
          ))}
        </div>

        <div className="gap-mol grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          {FLOW_STEPS.map((step) => (
            <div key={`${step.titleKey}-desc`} className="gap-atom flex flex-col">
              <b className="text-sm font-extrabold sm:text-base">{t(step.titleKey)}</b>
              <span className="text-muted text-xs leading-relaxed sm:text-sm">
                {t(step.descKey)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="gap-mol flex flex-col">
        <h2 className="text-foreground text-xl font-extrabold">{t("rulesSectionTitle")}</h2>
        <div className="gap-mol grid grid-cols-1 md:grid-cols-2">
          {RULE_KEYS.map((rule) => (
            <div
              key={rule.title}
              className="border-border bg-surface gap-atom-md p-pad-mol flex flex-col rounded-2xl border"
            >
              <h3 className="text-foreground text-base font-extrabold">{t(rule.title)}</h3>
              <p className="text-muted text-sm leading-relaxed">{t(rule.body)}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="text-muted text-xs leading-relaxed sm:text-sm">{t("disclaimer")}</p>
    </div>
  );
}

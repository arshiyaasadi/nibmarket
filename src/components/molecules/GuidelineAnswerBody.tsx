/**
 * @level molecule
 * Rich answer bodies matching Deposit Rules mockup layouts.
 * @spacing internal: gap-mol gap-atom-md | external: none
 */
import type { GuidelineItem } from "@/features/guidelines";
import {
  getMarketingBadgeByCode,
  MARKETING_BADGES,
  type MarketingBadgeDef,
} from "@/resources/data/marketing-badges";
import { cn } from "@/lib/utils";

const FORMULA_OPS = ["=", "×", "÷", "÷"] as const;

function pn(n: number) {
  return n.toLocaleString("fa-IR");
}

function resolvePresentationBadges(
  badgeCodes: MarketingBadgeDef["code"][] | undefined,
): MarketingBadgeDef[] {
  if (!badgeCodes?.length) return MARKETING_BADGES;
  return badgeCodes
    .map((code) => getMarketingBadgeByCode(code))
    .filter((badge): badge is MarketingBadgeDef => Boolean(badge));
}

export function GuidelineAnswerBody({ item }: { item: GuidelineItem }) {
  const { presentation, answer } = item;

  switch (presentation.type) {
    case "badges": {
      const badges = resolvePresentationBadges(presentation.badgeCodes);
      return (
        <div className="gap-mol flex flex-col">
          <p className="text-muted text-sm leading-relaxed">{answer}</p>
          {badges.length === 0 ? null : (
            <ul className="gap-mol grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
              {badges.map((badge) => (
                <li key={badge.code}>
                  <article className="border-border bg-background gap-atom-md p-pad-mol flex h-full flex-col rounded-2xl border">
                    {badge.imageSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={badge.imageSrc}
                        alt=""
                        className="mx-auto size-16 object-contain"
                        aria-hidden
                      />
                    ) : (
                      <span
                        className="bg-primary/10 text-primary mx-auto flex size-14 items-center justify-center rounded-2xl text-xl font-black"
                        aria-hidden
                      >
                        {badge.letter}
                      </span>
                    )}
                    <div className="gap-atom flex flex-col text-center">
                      <h3 className="text-foreground text-sm font-bold">{badge.title}</h3>
                      <p className="text-muted text-xs leading-relaxed">{badge.description}</p>
                      <p className="text-primary text-sm font-black tabular-nums">
                        {pn(badge.reward)}
                        <span className="text-muted ms-atom text-[10px] font-medium">تنوین</span>
                      </p>
                    </div>
                    <div className="gap-atom-md border-border pt-pad-atom-md flex flex-col border-t">
                      <p className="text-foreground text-center text-[11px] font-bold">
                        شرایط دریافت
                      </p>
                      <ul className="gap-atom flex flex-col">
                        {badge.conditions.map((condition) => (
                          <li
                            key={condition}
                            className="border-border bg-surface text-muted gap-atom-md px-pad-atom-md py-pad-atom-md flex rounded-xl border text-[11px] leading-relaxed"
                          >
                            <span className="bg-primary mt-1 size-1.5 shrink-0 rounded-full" />
                            {condition}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }

    case "stat":
      return (
        <div className="border-border bg-background gap-atom p-pad-mol flex flex-col rounded-2xl border">
          <span className="text-primary text-2xl font-black">{presentation.value}</span>
          <p className="text-muted text-sm leading-relaxed">{answer}</p>
        </div>
      );

    case "highlights":
      return (
        <div className="gap-mol grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          {presentation.items.map((card) => (
            <div
              key={card.value}
              className="border-border bg-background gap-atom p-pad-mol flex flex-col rounded-2xl border"
            >
              <span className="text-primary text-2xl font-black">{card.value}</span>
              <span className="text-muted text-sm leading-relaxed">{card.desc}</span>
            </div>
          ))}
        </div>
      );

    case "formula":
      return (
        <div className="gap-stack-mol flex flex-col">
          <p className="text-muted text-sm leading-relaxed">{presentation.lead}</p>

          <div className="gap-atom-md flex flex-wrap items-center text-sm font-bold">
            <span className="bg-primary px-pad-mol py-pad-atom-md rounded-xl text-white">
              {presentation.result}
            </span>
            {presentation.factors.map((factor, i) => (
              <span key={factor} className="contents">
                <span aria-hidden className="text-muted">
                  {FORMULA_OPS[i]}
                </span>
                <span className="bg-primary/10 text-foreground px-pad-mol py-pad-atom-md rounded-xl">
                  {factor}
                </span>
              </span>
            ))}
          </div>

          <div className="gap-mol grid grid-cols-1 md:grid-cols-3">
            {presentation.rates.map((rate) => (
              <div
                key={rate.rate}
                className="border-border bg-background gap-atom p-pad-mol flex flex-col rounded-xl border"
              >
                <span className="text-primary text-xl font-black">{rate.rate}</span>
                <span className="text-muted text-sm leading-relaxed">{rate.desc}</span>
              </div>
            ))}
          </div>

          <p className="bg-background px-pad-mol py-pad-atom-md rounded-xl text-sm leading-relaxed">
            <b>{presentation.exampleLabel}</b> {presentation.example}
          </p>
        </div>
      );

    case "flow":
      return (
        <div className="gap-stack-mol flex flex-col">
          <p className="text-muted text-sm leading-relaxed">{presentation.lead}</p>

          <div
            role="img"
            aria-label={presentation.chartAria}
            className="border-border gap-atom-md px-atom-md grid h-[13.75rem] grid-cols-2 items-end border-b-2 sm:grid-cols-4"
          >
            {presentation.steps.map((step) => (
              <div key={step.title} className="gap-atom-md flex h-full flex-col justify-end">
                <span
                  className={cn("text-center text-sm font-extrabold", step.empty && "text-muted")}
                >
                  {step.amount}
                </span>
                <div
                  className={cn(
                    "w-full rounded-t-lg",
                    step.barClass,
                    step.empty ? "bg-muted/40" : "bg-primary",
                  )}
                />
              </div>
            ))}
          </div>

          <div className="gap-mol grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            {presentation.steps.map((step) => (
              <div key={`${step.title}-desc`} className="gap-atom flex flex-col">
                <b className="text-sm font-extrabold">{step.title}</b>
                <span className="text-muted text-xs leading-relaxed sm:text-sm">{step.desc}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case "rates":
      return (
        <div className="gap-mol flex flex-col">
          <p className="text-muted text-sm leading-relaxed">{answer}</p>
          <div className="gap-mol grid grid-cols-1 md:grid-cols-3">
            {presentation.rates.map((rate) => (
              <div
                key={rate.rate}
                className="border-border bg-background gap-atom p-pad-mol flex flex-col rounded-xl border"
              >
                <span className="text-primary text-xl font-black">{rate.rate}</span>
                <span className="text-muted text-sm leading-relaxed">{rate.desc}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case "text":
    default:
      return <p className="text-muted text-sm leading-relaxed whitespace-pre-line">{answer}</p>;
  }
}

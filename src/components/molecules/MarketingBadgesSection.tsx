"use client";

import { useMemo, useState } from "react";
import { Info } from "lucide-react";
import { cn, formatDisplayDate } from "@/lib/utils";
import {
  getMarketingBadgeByCode,
  getMarketingBadgeByMissionCode,
  MARKETING_BADGES,
  type MarketingBadgeDef,
} from "@/resources/data/marketing-badges";
import { MarketingBadgeDetailModal } from "@/components/molecules/MarketingBadgeDetailModal";
import type { MarketingBadgeItem } from "@/types/mlm";

export type MarketingBadgesSectionProps = {
  title: string;
  subtitle?: string;
  /** Live badges from GET /missions/sections/badges */
  items: MarketingBadgeItem[];
  className?: string;
  compact?: boolean;
};

function pn(n: number) {
  return n.toLocaleString("fa-IR");
}

function resolveKnownBadge(item: MarketingBadgeItem): MarketingBadgeDef | undefined {
  return (
    getMarketingBadgeByCode(item.code) ||
    getMarketingBadgeByMissionCode(item.missionCode) ||
    MARKETING_BADGES.find((b) => b.title === item.title.trim())
  );
}

function letterFor(item: MarketingBadgeItem): string {
  const known = resolveKnownBadge(item);
  if (known?.letter) return known.letter;
  const trimmed = item.title.trim();
  return trimmed ? trimmed.slice(0, 1) : "?";
}

function resolveBadgeImage(item: MarketingBadgeItem): string | null {
  const known = resolveKnownBadge(item);
  const fromApi = item.imageUrl?.trim();
  // Prefer local artwork when API sends empty / missing URL (common in live BE).
  return fromApi || known?.imageSrc || null;
}

function toDetailBadge(item: MarketingBadgeItem): MarketingBadgeDef {
  const known = resolveKnownBadge(item);
  return {
    code: item.code,
    letter: letterFor(item),
    title: item.title || known?.title || item.code,
    description: item.description || known?.description || "",
    conditions: known?.conditions?.length
      ? known.conditions
      : item.description
        ? [item.description]
        : [],
    reward: item.reward,
    missionCode: item.missionCode || known?.missionCode || item.code,
    imageSrc: resolveBadgeImage(item),
  };
}

export function MarketingBadgesSection({
  title,
  subtitle,
  items,
  className,
  compact = false,
}: MarketingBadgesSectionProps) {
  const [active, setActive] = useState<MarketingBadgeItem | null>(null);

  const activeDetail = useMemo(() => (active ? toDetailBadge(active) : null), [active]);
  const activeAchievedLabel = active?.achievedAt ? formatDisplayDate(active.achievedAt) : null;

  return (
    <>
      <section
        className={cn(
          "border-border bg-surface flex flex-col gap-3 rounded-2xl border p-4 sm:p-5",
          className,
        )}
      >
        <div>
          <h2 className="text-foreground text-sm font-bold sm:text-base">{title}</h2>
          {subtitle ? <p className="text-muted mt-0.5 text-xs">{subtitle}</p> : null}
        </div>

        {items.length === 0 ? (
          <p className="text-muted py-4 text-center text-xs">نشانی برای نمایش نیست</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            {items.map((item, index) => {
              const detail = toDetailBadge(item);
              const imageSrc = detail.imageSrc;
              const unlocked = item.unlocked;
              const isLastOddMobile = index === items.length - 1 && items.length % 2 === 1;

              return (
                <li
                  key={item.code}
                  className={cn(
                    "border-border bg-background relative flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-center transition",
                    compact && "py-3",
                    unlocked
                      ? "border-yellow-500/40 shadow-[0_0_24px_-12px_rgba(234,179,8,0.45)]"
                      : "opacity-45 grayscale-[0.4]",
                    isLastOddMobile &&
                      "col-span-2 mx-auto w-full max-w-[calc((100%-0.75rem)/2)] lg:col-span-1 lg:mx-0 lg:max-w-none",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setActive(item)}
                    className="text-muted hover:text-primary absolute end-2 top-2 inline-flex size-8 items-center justify-center rounded-full transition"
                    aria-label={`جزئیات ${detail.title}`}
                  >
                    <Info className="size-5" strokeWidth={2.25} />
                  </button>

                  {imageSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageSrc}
                      alt=""
                      className={cn("size-14 object-contain", !unlocked && "opacity-40 grayscale")}
                    />
                  ) : (
                    <div
                      className={cn(
                        "flex size-14 items-center justify-center rounded-2xl border text-xl font-black",
                        unlocked
                          ? "border-yellow-500/45 bg-yellow-500/12 text-yellow-600 dark:text-yellow-400"
                          : "border-border bg-surface-2 text-muted",
                      )}
                      aria-hidden
                    >
                      {detail.letter}
                    </div>
                  )}

                  <p className="text-foreground text-sm leading-tight font-bold">{detail.title}</p>
                  <p className="text-primary text-sm font-black tabular-nums">
                    {pn(detail.reward)}
                    <span className="text-muted ms-0.5 text-[10px] font-medium">تنوین</span>
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <MarketingBadgeDetailModal
        badge={activeDetail}
        open={active != null}
        onClose={() => setActive(null)}
        unlocked={active?.unlocked}
        achievedAtLabel={activeAchievedLabel}
      />
    </>
  );
}

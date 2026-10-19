"use client";

import { useMemo, useState } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MARKETING_BADGES,
  type MarketingBadgeCode,
  type MarketingBadgeDef,
} from "@/resources/data/marketing-badges";
import { MarketingBadgeDetailModal } from "@/components/molecules/MarketingBadgeDetailModal";

export type MarketingBadgeUnlockState = {
  unlocked: boolean;
  achievedAtLabel?: string | null;
  imageSrc?: string | null;
};

export type MarketingBadgesSectionProps = {
  /** Section heading */
  title: string;
  /** Optional subtitle under title */
  subtitle?: string;
  /** Map of badge code / missionCode → unlock state */
  unlockByMissionCode?: Record<string, MarketingBadgeUnlockState>;
  className?: string;
  /** denser grid for compact placements */
  compact?: boolean;
};

function pn(n: number) {
  return n.toLocaleString("fa-IR");
}

function resolveUnlock(
  badge: MarketingBadgeDef,
  unlockByMissionCode?: Record<string, MarketingBadgeUnlockState>,
): MarketingBadgeUnlockState {
  return (
    unlockByMissionCode?.[badge.missionCode] ??
    unlockByMissionCode?.[badge.code] ?? { unlocked: false }
  );
}

export function MarketingBadgesSection({
  title,
  subtitle,
  unlockByMissionCode,
  className,
  compact = false,
}: MarketingBadgesSectionProps) {
  const [active, setActive] = useState<MarketingBadgeDef | null>(null);

  const activeUnlock = useMemo(
    () => (active ? resolveUnlock(active, unlockByMissionCode) : null),
    [active, unlockByMissionCode],
  );

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

        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {MARKETING_BADGES.map((badge, index) => {
            const state = resolveUnlock(badge, unlockByMissionCode);
            const imageSrc = state.imageSrc ?? badge.imageSrc;
            const isLastOddMobile =
              index === MARKETING_BADGES.length - 1 && MARKETING_BADGES.length % 2 === 1;

            return (
              <li
                key={badge.code}
                className={cn(
                  "border-border bg-background relative flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-center transition",
                  compact && "py-3",
                  state.unlocked
                    ? "border-yellow-500/40 shadow-[0_0_24px_-12px_rgba(234,179,8,0.45)]"
                    : "opacity-45 grayscale-[0.4]",
                  // Mobile 2-col: center last badge when odd; desktop: all in one row
                  isLastOddMobile &&
                    "col-span-2 mx-auto w-full max-w-[calc((100%-0.75rem)/2)] lg:col-span-1 lg:mx-0 lg:max-w-none",
                )}
              >
                <button
                  type="button"
                  onClick={() => setActive(badge)}
                  className="text-muted hover:text-primary absolute end-2 top-2 inline-flex size-8 items-center justify-center rounded-full transition"
                  aria-label={`جزئیات ${badge.title}`}
                >
                  <Info className="size-5" strokeWidth={2.25} />
                </button>

                {imageSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageSrc}
                    alt=""
                    className={cn(
                      "size-14 rounded-2xl object-cover",
                      !state.unlocked && "opacity-40 grayscale",
                    )}
                  />
                ) : (
                  <div
                    className={cn(
                      "flex size-14 items-center justify-center rounded-2xl border text-xl font-black",
                      state.unlocked
                        ? "border-yellow-500/45 bg-yellow-500/12 text-yellow-600 dark:text-yellow-400"
                        : "border-border bg-surface-2 text-muted",
                    )}
                    aria-hidden
                  >
                    {badge.letter}
                  </div>
                )}

                <p className="text-foreground text-sm leading-tight font-bold">{badge.title}</p>
                <p className="text-primary text-sm font-black tabular-nums">
                  {pn(badge.reward)}
                  <span className="text-muted ms-0.5 text-[10px] font-medium">تنوین</span>
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <MarketingBadgeDetailModal
        badge={active}
        open={active != null}
        onClose={() => setActive(null)}
        unlocked={activeUnlock?.unlocked}
        achievedAtLabel={activeUnlock?.achievedAtLabel}
      />
    </>
  );
}

/** Helper to build unlock map from completed mission codes */
export function buildBadgeUnlockMap(
  completed: Array<{
    missionCode: string;
    achievedAtLabel?: string | null;
    imageSrc?: string | null;
  }>,
): Record<string, MarketingBadgeUnlockState> {
  const map: Record<string, MarketingBadgeUnlockState> = {};
  for (const row of completed) {
    map[row.missionCode] = {
      unlocked: true,
      achievedAtLabel: row.achievedAtLabel,
      imageSrc: row.imageSrc,
    };
  }
  return map;
}

export type { MarketingBadgeCode };

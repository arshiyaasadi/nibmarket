/**
 * @level molecule
 * @spacing internal: gap-atom-md p-pad-mol | external: none
 */
import type { MarketingBadgeDef } from "@/resources/data/marketing-badges";

function pn(n: number) {
  return n.toLocaleString("fa-IR");
}

export function LandingBadgeCard({ badge }: { badge: MarketingBadgeDef }) {
  return (
    <article className="border-border bg-background gap-atom-md p-pad-mol flex h-full flex-col rounded-2xl border text-center">
      <span
        className="bg-primary/10 text-primary mx-auto flex size-12 items-center justify-center rounded-2xl text-xl font-black"
        aria-hidden
      >
        {badge.letter}
      </span>
      <h3 className="text-foreground text-sm font-bold">{badge.title.replace(/^نشان\s+/, "")}</h3>
      <p className="text-muted flex-1 text-xs leading-relaxed">{badge.description}</p>
      <p className="text-primary text-sm font-black tabular-nums">
        {pn(badge.reward)}
        <span className="text-muted ms-atom text-[10px] font-medium">تنوین</span>
      </p>
    </article>
  );
}

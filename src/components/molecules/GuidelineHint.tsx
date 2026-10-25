/**
 * @level molecule
 * Compact reusable guide callout for other screens.
 * @spacing internal: gap-atom-md | external: none
 */
import Link from "next/link";
import { ScrollText } from "lucide-react";
import { getGuidelinesByIds, guidelinesHref, type GuidelineId } from "@/features/guidelines";
import { cn } from "@/lib/utils";

export function GuidelineHint({
  ids,
  title = "راهنما",
  className,
  showMoreLink = true,
}: {
  ids: readonly GuidelineId[];
  title?: string;
  className?: string;
  showMoreLink?: boolean;
}) {
  const items = getGuidelinesByIds(ids);
  if (items.length === 0) return null;

  const first = items[0]!;

  return (
    <aside
      className={cn(
        "border-primary/20 bg-primary/5 gap-atom-md px-pad-mol py-pad-mol flex flex-col rounded-2xl border",
        className,
      )}
    >
      <div className="gap-atom-md flex flex-wrap items-center justify-between">
        <div className="text-primary gap-atom-md flex items-center text-xs font-bold">
          <ScrollText className="size-3.5 shrink-0" aria-hidden />
          {title}
        </div>
        {showMoreLink ? (
          <Link
            href={guidelinesHref(first.categoryId, first.id)}
            className="text-primary hover:text-primary/80 text-[11px] font-semibold no-underline"
          >
            مشاهده در قوانین
          </Link>
        ) : null}
      </div>
      <ul className="gap-atom-md flex flex-col">
        {items.map((item) => (
          <li key={item.id} className="gap-atom flex flex-col">
            <p className="text-foreground text-sm font-semibold">{item.question}</p>
            <p className="text-muted line-clamp-3 text-xs leading-relaxed">{item.answer}</p>
          </li>
        ))}
      </ul>
    </aside>
  );
}

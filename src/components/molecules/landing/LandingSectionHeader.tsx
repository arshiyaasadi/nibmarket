/**
 * @level molecule
 * @spacing internal: gap-atom-md | external: none
 */
import { cn } from "@/lib/utils";

export type LandingSectionHeaderProps = {
  eyebrow?: string;
  title: string;
  lead?: string;
  className?: string;
  light?: boolean;
};

export function LandingSectionHeader({
  eyebrow,
  title,
  lead,
  className,
  light = false,
}: LandingSectionHeaderProps) {
  return (
    <div className={cn("gap-atom-md mx-auto flex max-w-3xl flex-col text-center", className)}>
      {eyebrow ? (
        <span
          className={cn(
            "text-xs font-semibold tracking-wide",
            light ? "text-white/70" : "text-primary",
          )}
        >
          {eyebrow}
        </span>
      ) : null}
      <h2
        className={cn(
          "text-2xl leading-snug font-black sm:text-3xl",
          light ? "text-white" : "text-foreground",
        )}
      >
        {title}
      </h2>
      {lead ? (
        <p
          className={cn(
            "text-sm leading-relaxed sm:text-base",
            light ? "text-white/80" : "text-muted",
          )}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}

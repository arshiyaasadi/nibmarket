"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Mail, Zap } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

type MissionsBonusBannerProps = {
  onInvite?: () => void;
  className?: string;
  /**
   * When false/undefined, banner is hidden.
   * Pass true only when at least one mission has an active boost from API
   * (or legacy doubleBonus) so production stays clean until BE ships campaigns.
   */
  visible?: boolean;
  /** Optional override text from a future campaign API */
  message?: string;
};

export function MissionsBonusBanner({
  onInvite,
  className,
  visible = false,
  message,
}: MissionsBonusBannerProps) {
  const t = useTranslations("missions");

  if (!visible) return null;

  const cta = onInvite ? (
    <button
      type="button"
      onClick={onInvite}
      className="bg-primary hover:bg-primary/90 flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition"
    >
      <Mail className="size-3.5" />
      {t("alertCta")}
    </button>
  ) : (
    <Link
      href={ROUTES.NETWORK.ROOT}
      className="bg-primary hover:bg-primary/90 flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition"
    >
      <Mail className="size-3.5" />
      {t("alertCta")}
    </Link>
  );

  return (
    <div
      className={cn(
        "border-primary/25 from-primary/15 via-primary/5 flex items-center gap-3 rounded-xl border bg-gradient-to-l to-transparent px-3 py-2.5",
        className,
      )}
    >
      <div className="bg-primary/15 flex size-8 shrink-0 items-center justify-center rounded-lg">
        <Zap className="text-primary size-4" />
      </div>
      <p className="text-foreground min-w-0 flex-1 text-xs leading-relaxed sm:text-sm">
        {message ?? t("alertText")}
      </p>
      {cta}
    </div>
  );
}

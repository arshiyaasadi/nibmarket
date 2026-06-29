"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Mail, Zap } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

type MissionsBonusBannerProps = {
  onInvite?: () => void;
  className?: string;
};

export function MissionsBonusBanner({ onInvite, className }: MissionsBonusBannerProps) {
  const t = useTranslations("missions");

  const cta = onInvite ? (
    <button
      type="button"
      onClick={onInvite}
      className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary/90"
    >
      <Mail className="size-3.5" />
      {t("alertCta")}
    </button>
  ) : (
    <Link
      href={ROUTES.NETWORK.ROOT}
      className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary/90"
    >
      <Mail className="size-3.5" />
      {t("alertCta")}
    </Link>
  );

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-primary/20 bg-gradient-to-l from-primary/10 via-primary/5 to-transparent px-3 py-2.5",
        className,
      )}
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15">
        <Zap className="size-4 text-primary" />
      </div>
      <p className="min-w-0 flex-1 text-xs leading-relaxed text-foreground sm:text-sm">{t("alertText")}</p>
      {cta}
    </div>
  );
}

"use client";

import { Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useInviteQuota } from "@/features/network/queries";
import { cn } from "@/lib/utils";

type VipInviteButtonProps = {
  onClick: () => void;
  className?: string;
  fullWidth?: boolean;
};

export function VipInviteButton({ onClick, className, fullWidth = true }: VipInviteButtonProps) {
  const t = useTranslations("network");
  const { data: quota } = useInviteQuota();
  const remaining = quota?.remaining ?? 5;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={remaining <= 0}
      className={cn(
        "flex flex-col items-center gap-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50",
        fullWidth && "w-full",
        className,
      )}
    >
      <span className="flex items-center gap-2">
        <Send size={16} />
        {t("vipInviteBtn")}
      </span>
      {quota && (
        <span className="text-[11px] font-normal opacity-80">
          {t("vipInviteQuotaShort", {
            remaining: remaining.toLocaleString("fa-IR"),
            limit: quota.limit.toLocaleString("fa-IR"),
          })}
        </span>
      )}
    </button>
  );
}

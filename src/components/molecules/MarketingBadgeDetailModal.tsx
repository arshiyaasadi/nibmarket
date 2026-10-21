"use client";

import { CheckCircle2 } from "lucide-react";
import { Modal, ModalBody, ModalFooter } from "@/components/atoms/Modal";
import { cn } from "@/lib/utils";
import type { MarketingBadgeDef } from "@/resources/data/marketing-badges";

export type MarketingBadgeDetailModalProps = {
  badge: MarketingBadgeDef | null;
  open: boolean;
  onClose: () => void;
  unlocked?: boolean;
  achievedAtLabel?: string | null;
};

function pn(n: number) {
  return n.toLocaleString("fa-IR");
}

export function MarketingBadgeDetailModal({
  badge,
  open,
  onClose,
  unlocked = false,
  achievedAtLabel,
}: MarketingBadgeDetailModalProps) {
  if (!badge) return null;

  return (
    <Modal open={open} onClose={onClose} title={badge.title} size="md">
      <ModalBody className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          {badge.imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={badge.imageSrc}
              alt=""
              className={cn("size-20 object-contain", !unlocked && "opacity-40 grayscale")}
            />
          ) : (
            <div
              className={cn(
                "flex size-20 shrink-0 items-center justify-center rounded-2xl border text-3xl font-black",
                unlocked
                  ? "border-yellow-500/45 bg-yellow-500/12 text-yellow-600 dark:text-yellow-400"
                  : "border-border bg-surface-2 text-muted",
              )}
            >
              {badge.letter}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-primary text-2xl font-black tabular-nums">
              {pn(badge.reward)}
              <span className="text-muted ms-1 text-sm font-medium">تنوین</span>
            </p>
            {unlocked && (
              <p className="text-success mt-1 inline-flex items-center gap-1 text-xs font-semibold">
                <CheckCircle2 className="size-3.5" />
                {achievedAtLabel ?? ""}
              </p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-foreground mb-2 text-sm font-bold">شرایط دریافت</h3>
          <ul className="flex flex-col gap-2">
            {badge.conditions.map((c) => (
              <li
                key={c}
                className="border-border bg-background text-muted flex gap-2 rounded-xl border px-3 py-2.5 text-xs leading-relaxed"
              >
                <span className="bg-primary mt-1.5 size-1.5 shrink-0 rounded-full" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      </ModalBody>
      <ModalFooter>
        <button
          type="button"
          onClick={onClose}
          className="bg-primary hover:bg-primary/90 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition sm:w-auto"
        >
          بستن
        </button>
      </ModalFooter>
    </Modal>
  );
}

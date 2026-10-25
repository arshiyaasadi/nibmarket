/**
 * @level molecule
 * @spacing internal: gap-atom-md | external: none
 * Q&A accordion — same interaction pattern as legacy landing story/FAQ.
 */
"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import type { GuidelineId, GuidelineItem } from "@/features/guidelines";
import { GuidelineAnswerBody } from "@/components/molecules/GuidelineAnswerBody";
import { cn } from "@/lib/utils";

function resolveOpenId(
  items: GuidelineItem[],
  preferred: GuidelineId | null | undefined,
): GuidelineId | null {
  if (preferred && items.some((item) => item.id === preferred)) {
    return preferred;
  }
  if (preferred === null) {
    return null;
  }
  return items[0]?.id ?? null;
}

export function GuidelinesAccordion({
  items,
  initialOpenId,
}: {
  items: GuidelineItem[];
  /** Optional deep-link: open this question on mount / when it changes. */
  initialOpenId?: GuidelineId;
}) {
  /** `undefined` = follow `initialOpenId`; otherwise user override (incl. closed). */
  const [manualOpenId, setManualOpenId] = useState<GuidelineId | null | undefined>(undefined);

  const openId = resolveOpenId(items, manualOpenId !== undefined ? manualOpenId : initialOpenId);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="gap-atom-md flex flex-col">
      {items.map((item, index) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            id={`guideline-${item.id}`}
            className={cn(
              "border-border bg-surface overflow-hidden rounded-2xl border transition-shadow",
              isOpen && "shadow-primary/5 shadow-sm",
            )}
          >
            <button
              type="button"
              className="hover:bg-surface-2/60 gap-atom-md px-pad-mol py-pad-mol flex w-full items-center text-start transition-colors"
              aria-expanded={isOpen}
              onClick={() => setManualOpenId(isOpen ? null : item.id)}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-black transition-colors",
                  isOpen ? "bg-primary text-white" : "bg-primary/10 text-primary",
                )}
              >
                {(index + 1).toLocaleString("fa-IR")}
              </span>
              <span className="text-foreground min-w-0 flex-1 text-sm font-semibold">
                {item.question}
              </span>
              <ChevronDown
                className={cn(
                  "text-muted size-4 shrink-0 transition-transform duration-300",
                  isOpen && "rotate-180",
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  key="body"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="border-border px-pad-mol py-pad-mol border-t">
                    <GuidelineAnswerBody item={item} />
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

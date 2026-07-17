"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

type BottomSheetPanelProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
};

const subscribeNoop = () => () => {};
const getClientMounted = () => true;
const getServerSnapshot = () => false;

export function BottomSheetPanel({
  open,
  onClose,
  title,
  children,
  className,
}: BottomSheetPanelProps) {
  const mounted = useSyncExternalStore(subscribeNoop, getClientMounted, getServerSnapshot);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200]" dir="rtl">
          <motion.button
            type="button"
            aria-label="بستن"
            className="absolute inset-0 bg-black/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "bottom-sheet-title" : undefined}
            className={cn(
              "nib-bottom-sheet bg-surface absolute inset-x-0 bottom-0 mx-auto flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-2xl shadow-2xl",
              className,
            )}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 360 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex shrink-0 justify-center pt-3 pb-2">
              <div className="bg-border h-1 w-10 rounded-full" />
            </div>

            {title && (
              <div className="border-border shrink-0 border-b px-5 pb-3">
                <h2 id="bottom-sheet-title" className="text-foreground text-base font-semibold">
                  {title}
                </h2>
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

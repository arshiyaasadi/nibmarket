/**
 * @level atom
 * @spacing internal: p-pad-mol (container), px-mol-md py-pad-mol (header/body/footer), gap-pad-atom-md (footer), p-atom (close btn) | external: none
 */
"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: ModalSize;
  children: React.ReactNode;
  className?: string;
  closeOnBackdrop?: boolean;
}

const sizes: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
  full: "max-w-screen-lg",
};

const subscribeNoop = () => () => {};
const getClientMounted = () => true;
const getServerMounted = () => false;

export function Modal({
  open,
  onClose,
  title,
  size = "md",
  children,
  className,
  closeOnBackdrop = true,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const mounted = useSyncExternalStore(subscribeNoop, getClientMounted, getServerMounted);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="p-pad-mol fixed inset-0 z-[1300] flex items-center justify-center overflow-y-auto"
      dir="rtl"
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

      {/* Panel */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "bg-surface relative z-10 my-auto max-h-[calc(100vh-2rem)] w-full overflow-y-auto rounded-2xl shadow-lg",
          sizes[size],
          className,
        )}
      >
        {/* Header */}
        {title && (
          <div className="border-border px-mol-md py-pad-mol flex items-center justify-between border-b">
            <h2 id="modal-title" className="text-foreground text-base font-semibold">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-atom text-muted hover:bg-surface-2 hover:text-foreground rounded-lg transition-colors"
              aria-label="بستن"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="size-5"
              >
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        )}

        {children}
      </div>
    </div>,
    document.body,
  );
}

export function ModalBody({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-mol-md py-pad-mol", className)} {...props}>
      {children}
    </div>
  );
}

export function ModalFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "gap-pad-atom-md border-border px-mol-md py-pad-mol flex items-center justify-end border-t",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

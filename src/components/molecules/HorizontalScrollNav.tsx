"use client";

import { type RefObject } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  horizontalScrollIconClassName,
  scrollHorizontalBy,
  type HorizontalScrollDirection,
} from "@/lib/i18n/horizontal-scroll";

export function HorizontalScrollNav({
  scrollerRef,
  distance = 280,
  show = true,
  className = "",
}: {
  scrollerRef: RefObject<HTMLElement | null>;
  distance?: number;
  show?: boolean;
  className?: string;
}) {
  if (!show) return null;

  function handle(direction: HorizontalScrollDirection) {
    const el = scrollerRef.current;
    if (!el) return;
    scrollHorizontalBy(el, direction, distance);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => handle("prev")}
        className={`border-border bg-surface text-muted hover:text-foreground absolute start-1 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm ${className}`}
        aria-label="previous"
      >
        <ChevronLeft size={16} className={horizontalScrollIconClassName} />
      </button>
      <button
        type="button"
        onClick={() => handle("next")}
        className={`border-border bg-surface text-muted hover:text-foreground absolute end-1 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm ${className}`}
        aria-label="next"
      >
        <ChevronRight size={16} className={horizontalScrollIconClassName} />
      </button>
    </>
  );
}

/** Pagination-style prev/next icons (same RTL-safe rotation). */
export function PaginationNavIcon({ direction }: { direction: HorizontalScrollDirection }) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  return <Icon size={14} className={horizontalScrollIconClassName} />;
}

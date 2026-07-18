/**
 * Direction-aware horizontal scroll helpers.
 * Always use reading-order semantics (`prev` / `next`), never physical left/right.
 */

export type HorizontalScrollDirection = "prev" | "next";

export function isRtlElement(element: HTMLElement): boolean {
  return getComputedStyle(element).direction === "rtl";
}

/** Scroll an overflow-x container toward previous or next content. */
export function scrollHorizontalBy(
  element: HTMLElement,
  direction: HorizontalScrollDirection,
  distance = 280,
): void {
  const rtl = isRtlElement(element);
  let delta = direction === "next" ? distance : -distance;
  if (rtl) delta = -delta;
  element.scrollBy({ left: delta, behavior: "smooth" });
}

/** Icon names for horizontal nav — pair with `rtl:rotate-180` on the SVG. */
export const HORIZONTAL_SCROLL_ICON = {
  prev: "ChevronLeft",
  next: "ChevronRight",
} as const;

export const horizontalScrollIconClassName = "rtl:rotate-180";

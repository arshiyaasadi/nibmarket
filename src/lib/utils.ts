import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format a number as Persian locale string
export function formatNumber(n: number): string {
  return new Intl.NumberFormat("fa-IR").format(n);
}

const ISO_DATE_PREFIX = /^\d{4}-\d{2}-\d{2}T/;

/** Normalize API ISO strings (e.g. 7-digit fractional seconds) for JS Date parsing. */
function normalizeDateInput(value: string): string {
  return value.replace(/(\.\d{3})\d+(?=[Z+-]|$)/, "$1");
}

export function isIsoDateString(value: string): boolean {
  return ISO_DATE_PREFIX.test(value);
}

function toDate(value: Date | string | null | undefined): Date | null {
  if (value == null || value === "") return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const normalized = isIsoDateString(value) ? normalizeDateInput(value) : value;
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Format API or stored date values; skips already-formatted Persian strings. */
export function formatDisplayDate(value: Date | string | null | undefined): string {
  if (value == null || value === "") return "—";
  if (typeof value === "string" && !isIsoDateString(value)) return value;
  return formatDate(value);
}

/** Format API or stored datetime values; skips already-formatted strings. */
export function formatDisplayDateTime(value: Date | string | null | undefined): string {
  if (value == null || value === "") return "—";
  if (typeof value === "string" && !isIsoDateString(value)) return value;
  return formatDateTime(value);
}

/** Shorten long IDs for table cells — full value stays available for copy/navigation. */
export function truncateIdentifier(value: string, head = 6, tail = 4): string {
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

/** Persian calendar date, e.g. ۱۴۰۵/۰۴/۰۷ */
export function formatDate(value: Date | string | null | undefined): string {
  const d = toDate(value);
  if (!d) return "—";
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** Persian calendar date + time */
export function formatDateTime(value: Date | string | null | undefined): string {
  const d = toDate(value);
  if (!d) return "—";
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatDateRange(
  start: Date | string | null | undefined,
  end: Date | string | null | undefined,
): string {
  return `${formatDate(start)} — ${formatDate(end)}`;
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format a number as Persian locale string
export function formatNumber(n: number): string {
  return new Intl.NumberFormat("fa-IR").format(n);
}

const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}T/;
const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATE_SPACE = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/;

/** Normalize API ISO strings (e.g. 7-digit fractional seconds) for JS Date parsing. */
function normalizeDateInput(value: string): string {
  return value.replace(/(\.\d{3})\d+(?=[Z+-]|$)/, "$1");
}

export function isIsoDateString(value: string): boolean {
  return ISO_DATE_TIME.test(value) || ISO_DATE_ONLY.test(value) || ISO_DATE_SPACE.test(value);
}

function toDate(value: Date | string | null | undefined): Date | null {
  if (value == null || value === "") return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  let raw = value.trim();
  if (!raw) return null;

  if (ISO_DATE_TIME.test(raw)) {
    raw = normalizeDateInput(raw);
  } else if (ISO_DATE_ONLY.test(raw)) {
    // Noon avoids timezone day-shift when converting to Jalali
    raw = `${raw}T12:00:00`;
  } else if (ISO_DATE_SPACE.test(raw)) {
    raw = normalizeDateInput(raw.replace(" ", "T"));
  }

  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

const JALALI_DATE: Intl.DateTimeFormatOptions = {
  calendar: "persian",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
};

const JALALI_DATE_TIME: Intl.DateTimeFormatOptions = {
  calendar: "persian",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
};

/** Format API or stored date values as Jalali (شمسی). */
export function formatDisplayDate(value: Date | string | null | undefined): string {
  if (value == null || value === "") return "—";
  const d = toDate(value);
  if (d) return formatDate(d);
  // Non-parseable label (already localized title, etc.)
  return typeof value === "string" ? value : "—";
}

/** Format API or stored datetime values as Jalali (شمسی). */
export function formatDisplayDateTime(value: Date | string | null | undefined): string {
  if (value == null || value === "") return "—";
  const d = toDate(value);
  if (d) return formatDateTime(d);
  return typeof value === "string" ? value : "—";
}

/** Shorten long IDs for table cells — full value stays available for copy/navigation. */
export function truncateIdentifier(value: string, head = 6, tail = 4): string {
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

/** Persian (Jalali) calendar date, e.g. ۱۴۰۵/۰۱/۰۱ */
export function formatDate(value: Date | string | null | undefined): string {
  const d = toDate(value);
  if (!d) return "—";
  return new Intl.DateTimeFormat("fa-IR", JALALI_DATE).format(d);
}

/** Persian (Jalali) calendar date + time */
export function formatDateTime(value: Date | string | null | undefined): string {
  const d = toDate(value);
  if (!d) return "—";
  return new Intl.DateTimeFormat("fa-IR", JALALI_DATE_TIME).format(d);
}

export function formatDateRange(
  start: Date | string | null | undefined,
  end: Date | string | null | undefined,
): string {
  return `${formatDate(start)} — ${formatDate(end)}`;
}

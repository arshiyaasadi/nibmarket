/**
 * @level molecule
 * Jalali calendar date picker (no time) via react-multi-date-picker.
 * Emits `YYYY/MM/DD` Jalali strings for Sejam/KYC APIs.
 */
"use client";

import { useMemo } from "react";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { cn } from "@/lib/utils";
import { toEnglishDigits } from "@/lib/normalization/digits";

export type JalaliDatePickerProps = {
  value: string | null;
  onChange: (jalaliYmd: string) => void;
  label?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  /** Initial calendar view when value is empty (default: 1370/06/15). */
  defaultViewJalali?: string;
};

function parseJalaliValue(value: string | null): DateObject | null {
  if (!value) return null;
  const normalized = toEnglishDigits(value).trim().replace(/-/g, "/");
  const match = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/.exec(normalized);
  if (!match) return null;
  const [, y, m, d] = match;
  return new DateObject({
    year: Number(y),
    month: Number(m),
    day: Number(d),
    calendar: persian,
    locale: persian_fa,
  });
}

export function JalaliDatePicker({
  value,
  onChange,
  label,
  error,
  hint,
  placeholder,
  disabled,
  className,
  id,
  defaultViewJalali = "1370/06/15",
}: JalaliDatePickerProps) {
  const inputId = id ?? "jalali-date";
  const hasError = Boolean(error);
  const parsed = useMemo(() => parseJalaliValue(value), [value]);
  const currentDate = useMemo(
    () => parsed ?? parseJalaliValue(defaultViewJalali) ?? new DateObject({ calendar: persian }),
    [parsed, defaultViewJalali],
  );
  const maxDate = useMemo(() => new DateObject({ calendar: persian, locale: persian_fa }), []);
  const minDate = useMemo(
    () =>
      new DateObject({
        year: 1300,
        month: 1,
        day: 1,
        calendar: persian,
        locale: persian_fa,
      }),
    [],
  );

  return (
    <div className={cn("gap-pad-atom flex flex-col", className)} dir="rtl">
      {label && (
        <label htmlFor={inputId} className="text-foreground text-sm font-medium">
          {label}
        </label>
      )}
      <DatePicker
        id={inputId}
        value={parsed}
        currentDate={currentDate}
        onChange={(date) => {
          if (!date || Array.isArray(date)) return;
          onChange(toEnglishDigits(date.format("YYYY/MM/DD")));
        }}
        calendar={persian}
        locale={persian_fa}
        calendarPosition="bottom-center"
        format="YYYY/MM/DD"
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled}
        containerClassName="w-full"
        portal
        zIndex={1400}
        inputClass={cn(
          "h-11 w-full rounded-xl border bg-background/60 px-pad-atom-md text-sm text-foreground outline-none",
          "transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30",
          "disabled:cursor-not-allowed disabled:opacity-50",
          hasError
            ? "border-danger focus:border-danger focus:ring-red-400/40"
            : "border-white/15 hover:border-primary/40",
        )}
        className="rmdp-prime-dark"
        placeholder={placeholder}
      />
      {(hint || error) && (
        <p className={cn("text-xs", hasError ? "text-danger" : "text-muted")}>{error ?? hint}</p>
      )}
      <style>{`
        .rmdp-prime-dark.rmdp-wrapper,
        .rmdp-prime-dark .rmdp-calendar {
          background: #16161d !important;
          border: 1px solid rgba(255, 255, 255, 0.12) !important;
          border-radius: 1rem !important;
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45) !important;
          color: #f4f4f5 !important;
          font-family: inherit !important;
        }
        .rmdp-prime-dark .rmdp-header-values,
        .rmdp-prime-dark .rmdp-day,
        .rmdp-prime-dark .rmdp-week-day {
          color: #e4e4e7 !important;
        }
        .rmdp-prime-dark .rmdp-week-day {
          color: #a78bfa !important;
          font-weight: 600 !important;
        }
        .rmdp-prime-dark .rmdp-day.rmdp-today span {
          border: 1px solid rgba(167, 139, 250, 0.7) !important;
          background: transparent !important;
        }
        .rmdp-prime-dark .rmdp-day.rmdp-selected span:not(.highlight) {
          background: #7c3aed !important;
          box-shadow: none !important;
          color: #fff !important;
        }
        .rmdp-prime-dark .rmdp-day:not(.rmdp-disabled):not(.rmdp-day-hidden) span:hover {
          background: rgba(124, 58, 237, 0.25) !important;
        }
        .rmdp-prime-dark .rmdp-arrow {
          border-color: #c4b5fd !important;
        }
        .rmdp-prime-dark .rmdp-arrow-container:hover {
          background: rgba(124, 58, 237, 0.2) !important;
          box-shadow: none !important;
        }
        .rmdp-prime-dark .rmdp-day.rmdp-disabled span {
          color: #52525b !important;
        }
      `}</style>
    </div>
  );
}

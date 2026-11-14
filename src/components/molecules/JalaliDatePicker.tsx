/**
 * @level molecule
 * Jalali calendar date picker (no time) via react-multi-date-picker.
 * Emits `YYYY/MM/DD` Jalali strings for Sejam/KYC APIs.
 */
"use client";

import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { cn } from "@/lib/utils";
import { toEnglishDigits } from "@/lib/normalization/digits";
import "react-multi-date-picker/styles/backgrounds/bg-dark.css";

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
};

function parseJalaliValue(value: string | null): DateObject | null {
  if (!value) return null;
  const normalized = value.trim().replace(/-/g, "/");
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
}: JalaliDatePickerProps) {
  const inputId = id ?? "jalali-date";
  const hasError = Boolean(error);

  return (
    <div className={cn("gap-pad-atom flex flex-col", className)} dir="rtl">
      {label && (
        <label htmlFor={inputId} className="text-foreground text-sm font-medium">
          {label}
        </label>
      )}
      <DatePicker
        id={inputId}
        value={parseJalaliValue(value)}
        onChange={(date) => {
          if (!date || Array.isArray(date)) return;
          // Locale may emit Persian digits — API expects ASCII YYYY/MM/DD.
          onChange(toEnglishDigits(date.format("YYYY/MM/DD")));
        }}
        calendar={persian}
        locale={persian_fa}
        calendarPosition="bottom-right"
        format="YYYY/MM/DD"
        maxDate={new DateObject({ calendar: persian, locale: persian_fa })}
        disabled={disabled}
        containerClassName="w-full"
        inputClass={cn(
          "h-11 w-full rounded-md border bg-surface px-pad-atom-md text-sm text-foreground outline-none",
          "transition-colors focus:border-primary focus:ring-2 focus:ring-primary-400",
          "disabled:cursor-not-allowed disabled:opacity-50",
          hasError
            ? "border-danger focus:border-danger focus:ring-red-400"
            : "border-border hover:border-primary-300",
        )}
        className="bg-dark"
        placeholder={placeholder}
      />
      {(hint || error) && (
        <p className={cn("text-xs", hasError ? "text-danger" : "text-muted")}>{error ?? hint}</p>
      )}
    </div>
  );
}

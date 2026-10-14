/**
 * @level molecule
 * Jalali calendar + time via react-multi-date-picker → ISO UTC for API.
 */
"use client";

import { useMemo, useState } from "react";
import DatePicker, { DateObject } from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { useTranslations } from "next-intl";
import { formatDateTime, cn } from "@/lib/utils";
import "react-multi-date-picker/styles/backgrounds/bg-dark.css";

export type JalaliDateTimePickerProps = {
  valueIso: string | null;
  onChange: (isoUtc: string) => void;
  className?: string;
  minFutureMinutes?: number;
};

function toPickerValue(valueIso: string | null, minMs: number): DateObject {
  const base =
    valueIso && !Number.isNaN(Date.parse(valueIso)) ? new Date(valueIso) : new Date(minMs);
  return new DateObject(base).convert(persian, persian_fa);
}

export function JalaliDateTimePicker({
  valueIso,
  onChange,
  className,
  minFutureMinutes = 5,
}: JalaliDateTimePickerProps) {
  const t = useTranslations("admin.systemMessages");
  // Capture wall clock once on mount (lazy init is not re-run on render).
  const [minMs] = useState(() => Date.now() + minFutureMinutes * 60_000);

  const value = useMemo(() => toPickerValue(valueIso, minMs), [valueIso, minMs]);
  const minDate = useMemo(
    () => new DateObject(new Date(minMs)).convert(persian, persian_fa),
    [minMs],
  );

  return (
    <div className={cn("gap-atom-md flex flex-col", className)} dir="rtl">
      <DatePicker
        value={value}
        onChange={(date) => {
          if (!date || Array.isArray(date)) return;
          onChange(date.toDate().toISOString());
        }}
        calendar={persian}
        locale={persian_fa}
        calendarPosition="bottom-right"
        format="YYYY/MM/DD HH:mm"
        minDate={minDate}
        plugins={[<TimePicker key="time" position="bottom" hideSeconds />]}
        containerClassName="w-full"
        inputClass="border-border bg-background text-foreground h-11 w-full rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        className="bg-dark"
        placeholder={t("pickDateTime")}
      />
      {valueIso && (
        <p className="text-muted text-xs">
          {t("selectedDateTime", { value: formatDateTime(valueIso) })}
        </p>
      )}
    </div>
  );
}

"use client";

import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

export function AdminTableToolbar({
  value,
  onChange,
  placeholder,
  total,
  totalLabel,
  filters,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  total?: number;
  totalLabel?: (count: number) => string;
  filters?: React.ReactNode;
}) {
  const t = useTranslations("admin.common");

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="relative min-w-48 flex-1">
        <Search size={14} className="text-muted absolute start-3 top-1/2 -translate-y-1/2" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? t("searchPlaceholder")}
          className="border-border bg-surface text-foreground focus:border-primary w-full rounded-xl border py-2 ps-9 pe-9 text-sm outline-none"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-muted hover:text-foreground absolute end-2 top-1/2 -translate-y-1/2 rounded-md p-1"
            aria-label={t("clearSearch")}
          >
            <X size={14} />
          </button>
        )}
      </div>
      {filters}
      {total !== undefined && (
        <span className="text-muted shrink-0 text-xs">
          {totalLabel ? totalLabel(total) : t("totalRecords", { count: total })}
        </span>
      )}
    </div>
  );
}

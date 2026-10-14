/**
 * @level organism
 * Debounced search against GET /admin/users (name or mobile).
 * Shows suggestions when focused so the wizard/modal can pick recipients quickly.
 */
"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Loader2, Plus, Search, UserRound, X } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { normalizeSearchInput } from "@/lib/normalization/digits";
import type { AdminPaginatedResponse, AdminUserListItem } from "@/types/admin";
import { cn } from "@/lib/utils";

export type UserLazySearchProps = {
  onSelect: (user: AdminUserListItem) => void;
  excludeIds?: string[];
  placeholder?: string;
  className?: string;
};

function initials(user: AdminUserListItem): string {
  const first = (user.firstName || user.fullName || "?").trim().charAt(0);
  const last = (user.lastName || "").trim().charAt(0);
  return `${first}${last}`.toUpperCase() || "?";
}

export function UserLazySearch({
  onSelect,
  excludeIds = [],
  placeholder,
  className,
}: UserLazySearchProps) {
  const t = useTranslations("admin.systemMessages");
  const tCommon = useTranslations("common");
  const tAdminCommon = useTranslations("admin.common");
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(normalizeSearchInput(q)), 300);
    return () => window.clearTimeout(id);
  }, [q]);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const { data, isFetching, isError } = useQuery({
    queryKey: ["admin", "users", "lazy", debounced],
    queryFn: () => {
      const search = new URLSearchParams({
        page: "0",
        pageSize: "12",
      });
      if (debounced) search.set("search", debounced);
      return apiClient.get<AdminPaginatedResponse<AdminUserListItem>>(
        `${ENDPOINTS.ADMIN.USERS.LIST}?${search}`,
      );
    },
    enabled: open,
  });

  const results = (data?.data ?? []).filter((u) => !excludeIds.includes(u.id));

  function pick(user: AdminUserListItem) {
    onSelect(user);
    setQ("");
    setDebounced("");
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <label className="relative block">
        <Search
          size={16}
          className="text-muted pointer-events-none absolute start-3 top-1/2 z-[1] -translate-y-1/2"
          aria-hidden
        />
        <input
          type="search"
          value={q}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder ?? t("userSearchPlaceholder")}
          className={cn(
            "border-border bg-background text-foreground placeholder:text-muted/80",
            "focus:border-primary/40 focus:ring-primary/20 h-11 w-full rounded-2xl border ps-10 pe-10",
            "text-sm transition-shadow outline-none focus:ring-4",
          )}
          autoComplete="off"
        />
        {q ? (
          <button
            type="button"
            aria-label={tAdminCommon("clearSearch")}
            className="text-muted hover:text-foreground absolute end-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1"
            onClick={() => {
              setQ("");
              setDebounced("");
              setOpen(true);
            }}
          >
            <X size={14} />
          </button>
        ) : null}
      </label>

      {open && (
        <div
          id={listId}
          role="listbox"
          className={cn(
            "border-border bg-surface absolute inset-x-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-2xl border",
            "shadow-xl shadow-black/10 backdrop-blur-md",
          )}
        >
          <div className="border-border flex items-center justify-between gap-2 border-b px-3 py-2">
            <p className="text-muted text-[11px] font-medium">
              {debounced ? t("userSearchResults") : t("userSearchSuggestions")}
            </p>
            {isFetching && <Loader2 size={14} className="text-primary animate-spin" />}
          </div>

          <div className="max-h-60 overflow-y-auto p-1.5">
            {isError && (
              <p className="text-danger px-3 py-4 text-center text-xs">{t("userSearchError")}</p>
            )}

            {!isError && !isFetching && results.length === 0 && (
              <div className="text-muted flex flex-col items-center gap-2 px-3 py-8 text-center">
                <UserRound size={22} className="opacity-50" />
                <p className="text-xs">{tCommon("noResults")}</p>
              </div>
            )}

            {results.map((user) => {
              const name = user.fullName || `${user.firstName} ${user.lastName}`.trim();
              return (
                <button
                  key={user.id}
                  type="button"
                  role="option"
                  aria-selected={false}
                  className={cn(
                    "group hover:bg-primary/5 flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-start transition-colors",
                    "focus-visible:bg-primary/10 focus-visible:outline-none",
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(user)}
                >
                  <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                    {initials(user)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-foreground block truncate text-sm font-semibold">
                      {name}
                    </span>
                    <span className="text-muted block text-xs tabular-nums" dir="ltr">
                      {user.mobile}
                    </span>
                  </span>
                  <span className="bg-primary/10 text-primary flex size-7 shrink-0 items-center justify-center rounded-full opacity-70 transition-opacity group-hover:opacity-100">
                    <Plus size={14} aria-hidden />
                    <span className="sr-only">{t("userSearchAdd")}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

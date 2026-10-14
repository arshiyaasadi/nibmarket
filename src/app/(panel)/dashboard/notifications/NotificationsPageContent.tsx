"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { BellOff, CheckCheck } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { EmptyState } from "@/components/atoms/EmptyState";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/features/notifications/queries";
import type { NotificationType } from "@/types/mlm";
import { cn, formatDateTime } from "@/lib/utils";

const FILTERS: Array<NotificationType | "all"> = ["all", "system", "network", "promotion"];

export function NotificationsPageContent() {
  const t = useTranslations("pages.notifications");
  const [filter, setFilter] = useState<NotificationType | "all">("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useNotifications({
    page,
    limit: 20,
    type: filter === "all" ? undefined : filter,
  });
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const limit = data?.limit ?? 20;
  const hasMore = page * limit < total;

  return (
    <div className="flex flex-col gap-4" dir="rtl">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-foreground text-xl font-bold">{t("title")}</h1>
          <p className="text-muted mt-1 text-sm">{t("subtitle")}</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          loading={markAll.isPending}
          startIcon={<CheckCheck size={16} />}
          onClick={() => markAll.mutate()}
        >
          {t("markAllRead")}
        </Button>
      </header>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setFilter(key);
              setPage(1);
            }}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              filter === key
                ? "bg-primary text-white"
                : "bg-surface text-muted hover:text-foreground border-border border",
            )}
          >
            {t(key)}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-muted text-sm">…</p>}
      {isError && (
        <button type="button" className="text-primary text-sm" onClick={() => void refetch()}>
          {t("loadError")}
        </button>
      )}

      {!isLoading && items.length === 0 && (
        <EmptyState
          icon={<BellOff size={22} />}
          title={t("noNotifications")}
          description={t("noNotificationsDesc")}
        />
      )}

      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={cn(
                "border-border bg-surface/50 hover:bg-surface flex w-full flex-col gap-1 rounded-2xl border px-4 py-3 text-start transition-colors",
                !item.isRead && "border-primary/30 bg-primary/5",
              )}
              onClick={() => {
                if (!item.isRead) markRead.mutate(item.id);
              }}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-foreground text-sm font-semibold">{item.title}</span>
                {!item.isRead && (
                  <span className="bg-primary/15 text-primary rounded-full px-2 py-0.5 text-[10px] font-semibold">
                    {t("unread")}
                  </span>
                )}
                <span className="text-muted ms-auto text-[10px]">
                  {formatDateTime(item.createdAt)}
                </span>
              </div>
              <p className="text-muted text-sm whitespace-pre-wrap">{item.body}</p>
            </button>
          </li>
        ))}
      </ul>

      {(page > 1 || hasMore) && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            {t("prevPage")}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={!hasMore}
            onClick={() => setPage((p) => p + 1)}
          >
            {t("nextPage")}
          </Button>
        </div>
      )}
    </div>
  );
}

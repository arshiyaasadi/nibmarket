"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { BellOff, Check, Smartphone } from "lucide-react";
import { EmptyState } from "@/components/atoms/EmptyState";
import { usePersistedString } from "@/hooks/use-persisted-string";
import { normalizeMobile } from "@/lib/normalization/digits";
import { cn } from "@/lib/utils";

const MOBILE_STORAGE_KEY = "nib-admin-notification-mobile";

const TABS = [
  { key: "all", labelKey: "tabAll" },
  { key: "system", labelKey: "tabSystem" },
  { key: "users", labelKey: "tabUsers" },
  { key: "missions", labelKey: "tabMissions" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function isValidMobile(value: string): boolean {
  return /^09\d{9}$/.test(value);
}

export function NotificationsPageContent() {
  const t = useTranslations("admin.notifications");
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [savedMobile, setSavedMobile] = usePersistedString(MOBILE_STORAGE_KEY);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const normalized = normalizeMobile(mobile);

    if (!isValidMobile(normalized)) {
      setError(t("phoneInvalid"));
      return;
    }

    setError(null);
    setMobile("");
    setSavedMobile(normalized);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-foreground text-xl font-bold">{t("title")}</h1>
        <p className="text-muted mt-1 text-xs">{t("subtitle")}</p>
      </div>

      <section className="border-border bg-surface rounded-2xl border">
        <div className="border-border flex gap-1 overflow-x-auto border-b p-2">
          {TABS.map(({ key, labelKey }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                activeTab === key
                  ? "bg-primary/10 text-primary"
                  : "text-muted hover:bg-background hover:text-foreground",
              )}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>

        <EmptyState
          icon={<BellOff size={22} />}
          title={t("empty")}
          description={t("emptyDescription")}
        />
      </section>

      <section className="border-border bg-surface flex flex-col gap-4 rounded-2xl border p-5">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
            <Smartphone size={18} />
          </div>
          <div>
            <h2 className="text-foreground text-sm font-semibold">{t("phoneTitle")}</h2>
            <p className="text-muted mt-1 text-xs leading-5">{t("phoneDescription")}</p>
          </div>
        </div>

        {savedMobile && (
          <p className="flex items-center gap-2 rounded-xl bg-green-500/10 px-4 py-3 text-xs font-medium text-green-600">
            <Check size={15} />
            {t("phoneSaved", { mobile: savedMobile })}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="admin-notification-mobile" className="text-muted text-xs">
              {t("phoneLabel")}
            </label>
            <input
              id="admin-notification-mobile"
              value={mobile}
              onChange={(event) => setMobile(event.target.value)}
              placeholder={t("phonePlaceholder")}
              inputMode="numeric"
              dir="ltr"
              className="border-border bg-background text-foreground placeholder:text-muted focus:border-primary h-11 rounded-xl border-2 px-4 text-sm transition-colors focus:outline-none"
            />
            {error && <p className="text-danger text-xs">{error}</p>}
          </div>
          <button
            type="submit"
            className="bg-primary hover:bg-primary-600 h-11 shrink-0 rounded-xl px-6 text-sm font-semibold text-white transition-colors sm:mt-[1.375rem]"
          >
            {savedMobile ? t("phoneEdit") : t("phoneSubmit")}
          </button>
        </form>
      </section>
    </div>
  );
}

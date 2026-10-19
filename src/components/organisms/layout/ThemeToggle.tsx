"use client";

import { useEffect } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme, useSetTheme } from "@/store/slices/ui.slice";
import { cn } from "@/lib/utils";
import type { Theme } from "@/store/types/store.types";

function applyTheme(theme: Theme) {
  const html = document.documentElement;
  html.classList.remove("light", "dark");
  if (theme === "light") html.classList.add("light");
  else if (theme === "dark") html.classList.add("dark");
  // "system" → no class → CSS media query decides
}

const CYCLE: Theme[] = ["light", "dark", "system"];

export type ThemeToggleProps = {
  /** Single button that cycles themes — quieter for marketing chrome. */
  compact?: boolean;
};

export function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const theme = useTheme();
  const setTheme = useSetTheme();

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  if (compact) {
    const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
    const label = theme === "dark" ? "تم تیره" : theme === "light" ? "تم روشن" : "تم سیستم";
    return (
      <button
        type="button"
        aria-label={`${label} — تغییر تم`}
        title={label}
        onClick={() => {
          const i = CYCLE.indexOf(theme);
          setTheme(CYCLE[(i + 1) % CYCLE.length]!);
        }}
        className="border-border text-muted hover:text-foreground hover:bg-surface-2 flex size-9 items-center justify-center rounded-full border transition"
      >
        <Icon className="size-4" />
      </button>
    );
  }

  const options: { value: Theme; icon: React.ReactNode }[] = [
    { value: "light", icon: <Sun className="size-4" /> },
    { value: "dark", icon: <Moon className="size-4" /> },
    { value: "system", icon: <Monitor className="size-4" /> },
  ];

  return (
    <div className="border-border bg-surface-2 p-pad-atom-xs flex items-center rounded-lg border">
      {options.map(({ value, icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          className={cn(
            "h-control-h-sm w-control-h-sm flex items-center justify-center rounded-md transition-colors",
            theme === value
              ? "bg-primary text-white shadow-sm"
              : "text-muted hover:text-foreground",
          )}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}

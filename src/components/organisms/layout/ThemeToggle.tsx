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

export function ThemeToggle() {
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

  const options: { value: Theme; icon: React.ReactNode }[] = [
    { value: "light", icon: <Sun className="size-4" /> },
    { value: "dark",  icon: <Moon className="size-4" /> },
    { value: "system", icon: <Monitor className="size-4" /> },
  ];

  return (
    <div className="flex items-center rounded-lg border border-border bg-surface-2 p-pad-atom-xs">
      {options.map(({ value, icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          className={cn(
            "flex h-control-h-sm w-control-h-sm items-center justify-center rounded-md transition-colors",
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

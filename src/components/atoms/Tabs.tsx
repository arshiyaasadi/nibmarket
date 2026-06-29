/**
 * @level atom
 * @spacing internal: gap-atom-md (pills wrapper), px-pad-mol py-pad-atom gap-pad-atom (tab button), px-pad-atom py-pad-atom-xs (count badge) | external: none
 */
"use client";

import { cn } from "@/lib/utils";

export interface TabItem {
  key: string;
  label: string;
  count?: number;
  disabled?: boolean;
}

export type TabsVariant = "underline" | "pills" | "boxed";

export interface TabsProps {
  items: TabItem[];
  active: string;
  onChange: (key: string) => void;
  variant?: TabsVariant;
  className?: string;
}

export function Tabs({ items, active, onChange, variant = "underline", className }: TabsProps) {
  if (variant === "pills") {
    return (
      <div className={cn("flex flex-wrap gap-atom-md", className)}>
        {items.map((tab) => (
          <button
            key={tab.key}
            onClick={() => !tab.disabled && onChange(tab.key)}
            disabled={tab.disabled}
            className={cn(
              "inline-flex items-center gap-pad-atom rounded-full px-pad-mol py-pad-atom text-sm font-medium transition-colors",
              "disabled:pointer-events-none disabled:opacity-50",
              active === tab.key
                ? "bg-primary text-white"
                : "bg-surface-2 text-muted hover:bg-primary-50 hover:text-primary",
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-pad-atom py-pad-atom-xs text-xs font-bold",
                  active === tab.key ? "bg-white/25 text-white" : "bg-border text-muted",
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  if (variant === "boxed") {
    return (
      <div
        className={cn(
          "inline-flex gap-atom rounded-lg bg-surface-2 p-atom border border-border",
          className,
        )}
      >
        {items.map((tab) => (
          <button
            key={tab.key}
            onClick={() => !tab.disabled && onChange(tab.key)}
            disabled={tab.disabled}
            className={cn(
              "rounded-md px-pad-mol py-pad-atom text-sm font-medium transition-colors",
              "disabled:pointer-events-none disabled:opacity-50",
              active === tab.key
                ? "bg-surface shadow-sm text-foreground"
                : "text-muted hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    );
  }

  // underline (default)
  return (
    <div className={cn("flex border-b border-border gap-atom", className)}>
      {items.map((tab) => (
        <button
          key={tab.key}
          onClick={() => !tab.disabled && onChange(tab.key)}
          disabled={tab.disabled}
          className={cn(
            "inline-flex items-center gap-pad-atom border-b-2 px-pad-mol py-atom-md text-sm font-medium transition-colors",
            "-mb-px disabled:pointer-events-none disabled:opacity-50",
            active === tab.key
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:border-border hover:text-foreground",
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="rounded-full bg-primary-100 px-pad-atom py-pad-atom-xs text-xs font-bold text-primary-700">
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

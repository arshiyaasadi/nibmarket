/**
 * @level atom
 * @spacing internal: p-stack-mol (card), gap-pad-atom-md (row), gap-atom (text stack), p-atom-md (icon) | external: none
 */
import { cn } from "@/lib/utils";

export interface StatCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ title, value, trend, icon, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-stack-mol shadow-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-pad-atom-md">
        <div className="flex-1 min-w-0 flex flex-col gap-atom">
          <p className="truncate text-sm text-muted">{title}</p>
          <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
          {trend && (
            <p
              className={cn(
                "flex items-center gap-atom text-xs font-medium",
                trend.direction === "up" && "text-success",
                trend.direction === "down" && "text-danger",
                trend.direction === "neutral" && "text-muted",
              )}
            >
              {trend.direction === "up" && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-3.5">
                  <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
                </svg>
              )}
              {trend.direction === "down" && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-3.5">
                  <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
                </svg>
              )}
              {trend.value}
            </p>
          )}
        </div>

        {icon && (
          <div className="shrink-0 rounded-lg bg-primary-50 p-atom-md text-primary">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * @level atom
 * @spacing internal: gap-pad-atom (wrapper), px-pad-atom-md py-atom-md (input), pe-pad-addon|ps-pad-addon (icon offset) | external: none
 */
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  startAddon?: React.ReactNode;
  endAddon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, startAddon, endAddon, fullWidth = true, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const hasError = !!error;

    return (
      <div className={cn("flex flex-col gap-pad-atom", fullWidth && "w-full")}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
            {props.required && <span className="mr-atom text-danger">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {startAddon && (
            <div className="pointer-events-none absolute end-pad-atom-md text-muted">
              {startAddon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            dir="auto"
            className={cn(
              "w-full rounded-md border bg-surface px-pad-atom-md py-atom-md text-sm text-foreground placeholder:text-muted",
              "transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary",
              "disabled:cursor-not-allowed disabled:opacity-50",
              hasError
                ? "border-danger focus:ring-red-400 focus:border-danger"
                : "border-border hover:border-primary-300",
              startAddon && "ps-pad-addon",
              endAddon && "pe-pad-addon",
              className,
            )}
            {...props}
          />

          {endAddon && (
            <div className="pointer-events-none absolute start-pad-atom-md text-muted">
              {endAddon}
            </div>
          )}
        </div>

        {(hint || error) && (
          <p className={cn("text-xs", hasError ? "text-danger" : "text-muted")}>
            {error ?? hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };

/**
 * @level atom
 * @spacing internal: gap-atom-md (boxes) | external: none
 */
"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { normalizeOtp } from "@/lib/normalization/digits";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function OtpInput({ value, onChange, disabled }: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>(Array(6).fill(null));

  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  function focusAt(index: number) {
    refs.current[index]?.focus();
  }

  function handleChange(index: number, raw: string) {
    const char = normalizeOtp(raw).slice(-1);
    const next = digits.map((d, i) => (i === index ? char : d)).join("");
    onChange(next);
    if (char && index < 5) focusAt(index + 1);
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = digits.map((d, i) => (i === index ? "" : d)).join("");
        onChange(next);
      } else if (index > 0) {
        const next = digits.map((d, i) => (i === index - 1 ? "" : d)).join("");
        onChange(next);
        focusAt(index - 1);
      }
    } else if (e.key === "ArrowLeft") {
      focusAt(index + 1);
    } else if (e.key === "ArrowRight") {
      focusAt(index - 1);
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = normalizeOtp(e.clipboardData.getData("text"));
    const next = Array.from({ length: 6 }, (_, i) => pasted[i] ?? "").join("");
    onChange(next);
    focusAt(Math.min(pasted.length, 5));
  }

  return (
    <div className="flex items-center justify-center gap-atom-md" dir="ltr">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          onFocus={(e) => e.target.select()}
          className={cn(
            "size-11 rounded-lg border-2 text-center text-lg font-semibold tabular-nums caret-transparent",
            "border-border bg-surface text-foreground",
            "transition-colors focus:border-primary focus:outline-none",
            "disabled:opacity-50",
            digit ? "border-primary bg-primary-50 text-primary" : "",
          )}
        />
      ))}
    </div>
  );
}

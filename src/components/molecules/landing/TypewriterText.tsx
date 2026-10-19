/**
 * Character typewriter — normal typing pace (~human).
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type TypewriterSegment = {
  text: string;
  className?: string;
};

export type TypewriterTextProps = {
  /** Plain string or styled segments (typed in order). */
  text: string | TypewriterSegment[];
  /** ms per character — ~45–70 feels like natural typing. */
  speedMs?: number;
  className?: string;
  /** Restart key when content changes (e.g. FAQ index). */
  replayKey?: string | number;
  showCursor?: boolean;
  cursorClassName?: string;
  onDone?: () => void;
  /** Accessible full text (defaults to concatenated segments). */
  ariaLabel?: string;
};

function toSegments(text: string | TypewriterSegment[]): TypewriterSegment[] {
  if (typeof text === "string") return [{ text }];
  return text;
}

function fullText(segments: TypewriterSegment[]): string {
  return segments.map((s) => s.text).join("");
}

function sliceSegments(segments: TypewriterSegment[], count: number): TypewriterSegment[] {
  const out: TypewriterSegment[] = [];
  let remaining = count;
  for (const seg of segments) {
    if (remaining <= 0) {
      out.push({ ...seg, text: "" });
      continue;
    }
    const take = Math.min(seg.text.length, remaining);
    remaining -= take;
    out.push({ ...seg, text: seg.text.slice(0, take) });
  }
  return out;
}

type TypewriterInnerProps = Omit<TypewriterTextProps, "text" | "replayKey"> & {
  segments: TypewriterSegment[];
  target: string;
};

function TypewriterInner({
  segments,
  target,
  speedMs = 52,
  className,
  showCursor = true,
  cursorClassName,
  onDone,
  ariaLabel,
}: TypewriterInnerProps) {
  const [count, setCount] = useState(0);
  const done = count >= target.length;
  const finishedRef = useRef(false);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (count >= target.length) {
      if (!finishedRef.current) {
        finishedRef.current = true;
        onDoneRef.current?.();
      }
      return;
    }
    const t = window.setTimeout(() => setCount((c) => c + 1), speedMs);
    return () => window.clearTimeout(t);
  }, [count, target.length, speedMs]);

  const visible = sliceSegments(segments, count);

  return (
    <span className={cn(className)} aria-label={ariaLabel ?? target}>
      <span aria-hidden>
        {visible.map((seg, i) =>
          seg.text ? (
            <span key={i} className={seg.className}>
              {seg.text}
            </span>
          ) : null,
        )}
        {showCursor && !done ? (
          <span
            className={cn(
              "ms-0.5 inline-block h-[1em] w-[0.08em] translate-y-[0.12em] animate-pulse bg-current align-baseline",
              cursorClassName,
            )}
          />
        ) : null}
      </span>
    </span>
  );
}

export function TypewriterText({ text, replayKey, ...rest }: TypewriterTextProps) {
  const segments = toSegments(text);
  const target = fullText(segments);
  return (
    <TypewriterInner
      key={`${String(replayKey ?? "")}:${target}`}
      segments={segments}
      target={target}
      {...rest}
    />
  );
}

"use client";

import { useCallback, useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/** Reads a localStorage string reactively; returns `null` on the server. */
export function usePersistedString(key: string): [string | null, (value: string) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    () => null,
  );

  const setValue = useCallback(
    (next: string) => {
      try {
        localStorage.setItem(key, next);
      } catch {
        // storage unavailable — value stays in memory only for this render pass
      }
      listeners.forEach((listener) => listener());
    },
    [key],
  );

  return [value, setValue];
}

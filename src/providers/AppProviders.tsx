"use client";

import { QueryProvider } from "@/contexts/QueryProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}

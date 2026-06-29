import { ErrorBoundary } from "@/components/errors/ErrorBoundary";
import { PanelLayoutShell } from "./PanelLayoutShell";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <PanelLayoutShell>
      <ErrorBoundary>{children}</ErrorBoundary>
    </PanelLayoutShell>
  );
}

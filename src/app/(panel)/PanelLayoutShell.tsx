"use client";

import { useState } from "react";
import { PanelSidebar } from "@/components/organisms/layout/PanelSidebar";
import { PanelHeader } from "@/components/organisms/layout/PanelHeader";
import { useSyncWalletStore } from "@/hooks/use-sync-wallet-store";

export function PanelLayoutShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useSyncWalletStore();

  return (
    <div className="relative min-h-screen" dir="rtl">
      {/* Sidebar overlays content — no offset needed */}
      <PanelSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main: full width, small padding-start to clear collapsed icon sidebar */}
      <div className="">
        <PanelHeader onOpenMobile={() => setSidebarOpen(true)} />
        <main className="pt-pad-mol-md px-pad-mol sm:px-mol-md lg:px-org lg:pb-pad-mol-md pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] lg:ps-[6rem]">
          {children}
        </main>
      </div>
    </div>
  );
}

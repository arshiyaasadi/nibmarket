"use client";

import { useState } from "react";
import { PanelSidebar } from "@/components/organisms/layout/PanelSidebar";
import { PanelHeader } from "@/components/organisms/layout/PanelHeader";

export function PanelLayoutShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen relative" dir="rtl">
      {/* Sidebar overlays content — no offset needed */}
      <PanelSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main: full width, small padding-start to clear collapsed icon sidebar */}
      <div className="">
        <PanelHeader onOpenMobile={() => setSidebarOpen(true)} />
        <main className="pt-pad-mol-md pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] px-pad-mol sm:px-mol-md lg:px-org lg:ps-[6rem] lg:pb-pad-mol-md">
          {children}
        </main>
      </div>
    </div>
  );
}

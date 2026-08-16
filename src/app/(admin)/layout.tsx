import { AdminHeader } from "@/components/organisms/admin/AdminHeader";
import { AdminSidebar } from "@/components/organisms/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background relative min-h-screen" dir="rtl">
      {/* Rail overlays the content — main only clears the collapsed width */}
      <AdminSidebar />

      <div className="min-h-screen">
        <AdminHeader />
        <main className="p-6 ps-[6rem]">{children}</main>
      </div>
    </div>
  );
}

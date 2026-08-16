import { AdminHeader } from "@/components/organisms/admin/AdminHeader";
import { AdminSidebar } from "@/components/organisms/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background min-h-screen" dir="rtl">
      <AdminSidebar />
      <div className="min-h-screen ps-[4.5rem]">
        <AdminHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

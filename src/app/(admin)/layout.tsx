import { AdminSidebar } from "@/components/organisms/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AdminSidebar />
      <main className="min-h-screen ps-56">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

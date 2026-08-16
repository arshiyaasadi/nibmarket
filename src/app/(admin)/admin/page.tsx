import type { Metadata } from "next";
import AdminDashboardContent from "./AdminDashboardContent";
import { AdminDashboardTour } from "@/components/organisms/admin/AdminDashboardTour";

export const metadata: Metadata = { title: "داشبورد مدیریت — NIB Club" };

export default function AdminPage() {
  return (
    <>
      <AdminDashboardContent />
      <AdminDashboardTour />
    </>
  );
}

import type { Metadata } from "next";
import AdminDashboardContent from "./AdminDashboardContent";

export const metadata: Metadata = { title: "داشبورد مدیریت — NIB Club" };

export default function AdminPage() {
  return <AdminDashboardContent />;
}

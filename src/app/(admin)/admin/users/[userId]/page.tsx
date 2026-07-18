import type { Metadata } from "next";
import UserProfileContent from "./UserProfileContent";

export const metadata: Metadata = { title: "پروفایل کاربر — مدیریت" };

export default async function AdminUserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return <UserProfileContent userId={userId} />;
}

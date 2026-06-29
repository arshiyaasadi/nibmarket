import type { Metadata } from "next";
import UsersPageContent from "./UsersPageContent";

export const metadata: Metadata = { title: "کاربران — مدیریت" };
export default function UsersPage() { return <UsersPageContent />; }

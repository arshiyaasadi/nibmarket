import type { Metadata } from "next";
import { CoursesIndexClient } from "@/features/courses/CoursesIndexClient";

export const metadata: Metadata = {
  title: "دوره‌های آموزشی · تنوین",
  description: "دوره آموزشی سطح یک شبکه بازاریابان نوین",
};

export default function CoursesPage() {
  return <CoursesIndexClient />;
}

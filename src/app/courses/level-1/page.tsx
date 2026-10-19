import type { Metadata } from "next";
import { CourseDetailClient } from "@/features/courses/CourseDetailClient";
import { COURSE_LEVEL_1 } from "@/resources/data/courses";

export const metadata: Metadata = {
  title: "دوره آموزشی سطح یک · تنوین",
  description: COURSE_LEVEL_1.subtitle,
};

export default function CourseLevel1Page() {
  return <CourseDetailClient course={COURSE_LEVEL_1} />;
}

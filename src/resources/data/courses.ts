import { ROUTES } from "@/config/routes";

/** Public course catalog — level-1 ties to mission `training_level_1`. */
export type CourseDef = {
  id: string;
  slug: string;
  href: string;
  missionCode: "training_level_1";
  title: string;
  subtitle: string;
  durationLabel: string;
  /** Placeholder poster; real CDN asset can replace later. */
  posterSrc: string;
  /** Mock / sample progressive media URL for logged-in playback. */
  videoSrc: string;
};

export const COURSE_LEVEL_1: CourseDef = {
  id: "course-level-1",
  slug: "level-1",
  href: ROUTES.COURSE_LEVEL_1,
  missionCode: "training_level_1",
  title: "دوره آموزشی سطح یک",
  subtitle: "آشنایی با تنوین، نقش بازاریاب و مسیر شروع همکاری",
  durationLabel: "حدود ۱۲ دقیقه",
  posterSrc: "/landing/assets/hero-bg.png",
  videoSrc: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
};

export const COURSES: CourseDef[] = [COURSE_LEVEL_1];

export function getCourseBySlug(slug: string): CourseDef | undefined {
  return COURSES.find((c) => c.slug === slug);
}

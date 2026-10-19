"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, Clock } from "lucide-react";
import { CourseVideoPlayer } from "@/components/organisms/courses/CourseVideoPlayer";
import { CoursesShell } from "@/features/courses/CoursesShell";
import { ROUTES } from "@/config/routes";
import type { CourseDef } from "@/resources/data/courses";

export type CourseDetailClientProps = {
  course: CourseDef;
};

export function CourseDetailClient({ course }: CourseDetailClientProps) {
  const t = useTranslations("courses");

  return (
    <CoursesShell authReturnUrl={course.href}>
      <section className="gap-org px-pad-mol sm:px-pad-mol-md lg:px-org mx-auto flex w-full max-w-6xl flex-col">
        <div className="gap-mol flex flex-col">
          <Link
            href={ROUTES.COURSES}
            className="text-muted hover:text-foreground gap-atom inline-flex w-fit items-center text-sm transition"
          >
            <ArrowRight className="size-4" aria-hidden />
            {t("backToCourses")}
          </Link>

          <header className="gap-atom-md flex flex-col">
            <h1 className="text-foreground text-2xl font-black sm:text-3xl">{course.title}</h1>
            <p className="text-muted max-w-2xl text-sm leading-relaxed">{course.subtitle}</p>
            <div className="gap-mol flex flex-wrap items-center text-xs">
              <span className="text-muted gap-atom inline-flex items-center">
                <Clock className="size-3.5" aria-hidden />
                {t("duration")}: {course.durationLabel}
              </span>
              <span className="bg-primary/10 text-primary px-pad-atom-md py-pad-atom-xs rounded-full font-bold">
                {t("rewardHint")} · {t("rewardAmount")}
              </span>
            </div>
          </header>
        </div>

        <CourseVideoPlayer
          course={course}
          labels={{
            loginToWatch: t("loginToWatch"),
            loginCta: t("loginCta"),
            lockedHint: t("lockedHint"),
            playing: t("playing"),
          }}
        />
      </section>
    </CoursesShell>
  );
}

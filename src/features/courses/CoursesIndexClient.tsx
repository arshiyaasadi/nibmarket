"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { CoursesShell } from "@/features/courses/CoursesShell";
import { COURSES } from "@/resources/data/courses";

export function CoursesIndexClient() {
  const t = useTranslations("courses");

  return (
    <CoursesShell>
      <section className="gap-org px-pad-mol sm:px-pad-mol-md lg:px-org mx-auto flex w-full max-w-6xl flex-col">
        <header className="gap-mol flex flex-col">
          <p className="text-primary text-xs font-semibold tracking-wide">{t("pageTitle")}</p>
          <h1 className="text-foreground text-2xl font-black sm:text-3xl">{t("pageTitle")}</h1>
          <p className="text-muted max-w-2xl text-sm leading-relaxed">{t("pageLead")}</p>
        </header>

        <ul className="gap-mol grid grid-cols-1 md:grid-cols-2">
          {COURSES.map((course) => (
            <li key={course.id}>
              <Link
                href={course.href}
                className="border-border bg-surface hover:border-primary/30 group gap-mol flex h-full flex-col overflow-hidden rounded-2xl border transition"
              >
                <div className="bg-primary relative aspect-[16/9] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={course.posterSrc}
                    alt=""
                    className="size-full object-cover opacity-70 transition duration-500 group-hover:scale-105"
                  />
                  <div className="from-primary/80 absolute inset-0 bg-gradient-to-t to-transparent" />
                  <span className="bg-accent text-foreground gap-atom px-pad-atom-md py-pad-atom-xs absolute end-3 bottom-3 inline-flex items-center rounded-full text-xs font-bold">
                    <GraduationCap className="size-3.5" aria-hidden />
                    {course.durationLabel}
                  </span>
                </div>
                <div className="gap-atom-md px-pad-mol pb-pad-mol flex flex-1 flex-col">
                  <h2 className="text-foreground text-base font-bold">{course.title}</h2>
                  <p className="text-muted flex-1 text-xs leading-relaxed">{course.subtitle}</p>
                  <span className="text-primary gap-atom inline-flex items-center text-sm font-semibold">
                    {t("openCourse")}
                    <ArrowLeft className="size-4 transition group-hover:-translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </CoursesShell>
  );
}

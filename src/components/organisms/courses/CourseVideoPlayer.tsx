/**
 * @level organism
 * @spacing internal: gap-mol | external: none
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { Lock, Play } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { startAuthEntry } from "@/config/auth-redirect";
import { ROUTES } from "@/config/routes";
import { useCompleteMission } from "@/features/missions/queries";
import { useSession } from "@/hooks/use-session";
import type { CourseDef } from "@/resources/data/courses";
import { cn } from "@/lib/utils";

export type CourseVideoPlayerProps = {
  course: CourseDef;
  labels: {
    loginToWatch: string;
    loginCta: string;
    lockedHint: string;
    playing: string;
  };
};

export function CourseVideoPlayer({ course, labels }: CourseVideoPlayerProps) {
  const { isAuthenticated } = useSession();
  const complete = useCompleteMission();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const reported = useRef(false);

  function onLogin() {
    startAuthEntry(course.href || ROUTES.COURSE_LEVEL_1);
  }

  function reportComplete() {
    if (!isAuthenticated || reported.current || complete.isPending) return;
    reported.current = true;
    complete.mutate(course.missionCode);
  }

  /** Authenticated visit → complete training_level_1 (idempotent on BE). */
  useEffect(() => {
    if (!isAuthenticated || !course.missionCode) return;
    reportComplete();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per mount when authed
  }, [isAuthenticated, course.missionCode]);

  function onPlay() {
    setStarted(true);
    reportComplete();
  }

  function tryPlay() {
    if (!isAuthenticated) {
      onLogin();
      return;
    }
    void videoRef.current?.play();
  }

  return (
    <div className="border-border bg-surface overflow-hidden rounded-2xl border shadow-lg shadow-black/5">
      <div className="bg-primary relative aspect-video overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={course.posterSrc}
          alt=""
          className={cn(
            "absolute inset-0 size-full object-cover transition-opacity",
            started && isAuthenticated ? "opacity-0" : "opacity-60",
          )}
        />
        <div
          aria-hidden
          className="from-primary/90 via-primary/40 pointer-events-none absolute inset-0 bg-gradient-to-t to-transparent"
        />

        {isAuthenticated ? (
          <video
            ref={videoRef}
            className="relative z-[1] size-full object-cover"
            controls
            playsInline
            poster={course.posterSrc}
            preload="metadata"
            onPlay={onPlay}
            onPlaying={reportComplete}
          >
            <source src={course.videoSrc} type="video/mp4" />
          </video>
        ) : (
          <div className="gap-mol px-pad-mol relative z-[1] flex size-full flex-col items-center justify-center text-center text-white">
            <span className="flex size-16 items-center justify-center rounded-full bg-white/15 backdrop-blur-md">
              <Lock className="size-7" aria-hidden />
            </span>
            <div className="gap-atom-md flex max-w-sm flex-col">
              <p className="text-lg font-bold">{labels.loginToWatch}</p>
              <p className="text-sm text-white/80">{labels.lockedHint}</p>
            </div>
            <Button
              size="lg"
              onClick={onLogin}
              className="bg-accent text-foreground hover:bg-accent-hover border-0"
            >
              {labels.loginCta}
            </Button>
          </div>
        )}

        {isAuthenticated && !started ? (
          <button
            type="button"
            onClick={tryPlay}
            className="absolute inset-0 z-[2] flex items-center justify-center bg-black/25 transition hover:bg-black/35"
            aria-label={labels.playing}
          >
            <span className="bg-accent text-foreground flex size-16 items-center justify-center rounded-full shadow-xl">
              <Play className="ms-1 size-7 fill-current" aria-hidden />
            </span>
          </button>
        ) : null}
      </div>
    </div>
  );
}

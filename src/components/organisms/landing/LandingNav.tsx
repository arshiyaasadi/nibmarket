/**
 * @level organism
 * @spacing internal: gap-atom-md p-pad-atom-md | external: none
 */
"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { ThemeToggle } from "@/components/organisms/layout/ThemeToggle";
import { ROUTES } from "@/config/routes";
import { useSession } from "@/hooks/use-session";
import { useAuthSlice } from "@/store/slices/auth.slice";
import { cn } from "@/lib/utils";

const SECTION_LINKS = [
  { hash: "#story", label: "نحوه کار" },
  { hash: "#calc", label: "محاسبه درآمد" },
  { hash: "#badges", label: "نشان‌ها" },
  { hash: "#missions", label: "مأموریت‌ها" },
  { hash: "#pool", label: "رقابت ماهانه" },
  { hash: "#faq", label: "سؤالات" },
] as const;

export type LandingNavProps = {
  onAuthEntry: () => void;
  /** `landing` = in-page anchors; `site` = home hashes + courses (public pages). */
  linkMode?: "landing" | "site";
};

export function LandingNav({ onAuthEntry, linkMode = "landing" }: LandingNavProps) {
  const { isAuthenticated, fullName } = useSession();
  const hydrated = useSyncExternalStore(
    (onStoreChange) => useAuthSlice.persist.onFinishHydration(onStoreChange),
    () => useAuthSlice.persist.hasHydrated(),
    () => false,
  );
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    const frame = window.requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (linkMode !== "landing") return;
    const ids = SECTION_LINKS.map((l) => l.hash.slice(1));
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);

    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0]?.target.id;
        if (top) setActiveHash(`#${top}`);
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0.1, 0.35, 0.6] },
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [linkMode]);

  const showAuthed = hydrated && isAuthenticated;
  const onHero = linkMode === "landing" && !scrolled && !open;
  const brandHref = linkMode === "site" ? ROUTES.HOME : "#top";
  const sectionHref = (hash: string) => (linkMode === "site" ? `${ROUTES.HOME}${hash}` : hash);

  const links = [
    ...SECTION_LINKS.map((l) => ({ href: sectionHref(l.hash), label: l.label, hash: l.hash })),
    { href: ROUTES.COURSES, label: "دوره‌ها", hash: "" },
  ];

  return (
    <nav id="nav" className="sticky top-0 z-50 w-full">
      <div className="px-pad-mol sm:px-pad-mol-md lg:px-org">
        <div
          className={cn(
            "gap-atom-md mx-auto flex h-14 max-w-6xl items-center transition-all duration-300 sm:h-16",
            scrolled || open
              ? "border-border/50 bg-background/90 px-pad-mol mt-2 rounded-2xl border shadow-lg shadow-black/5 backdrop-blur-xl dark:shadow-black/30"
              : "bg-transparent px-0",
          )}
        >
          <Link
            href={brandHref}
            className={cn(
              "gap-atom-md flex min-w-0 items-center font-bold",
              onHero ? "text-white" : "text-foreground",
            )}
            onClick={() => setOpen(false)}
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-lg text-white shadow-sm",
                onHero ? "bg-white/15 backdrop-blur-sm" : "bg-primary shadow-primary/30",
              )}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                <path
                  d="M10 4 5.5 20M18 4l-4.5 16"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </span>
            <span className="truncate text-sm">شبکه بازاریابان نوین</span>
          </Link>

          <div className="gap-atom-md ms-auto hidden items-center xl:flex">
            {links.map((l) => {
              const active = linkMode === "landing" && l.hash && activeHash === l.hash;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "px-pad-atom-md py-pad-atom-xs rounded-full text-[13px] font-medium transition",
                    onHero
                      ? active
                        ? "bg-white/20 text-white"
                        : "text-white/75 hover:bg-white/10 hover:text-white"
                      : active
                        ? "bg-primary/10 text-primary"
                        : "text-muted hover:text-foreground hover:bg-surface-2/80",
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>

          <div className="gap-atom-md ms-auto flex items-center xl:ms-0">
            <span
              className={cn(
                "hidden sm:inline-flex",
                onHero && "[&_button]:border-white/25 [&_button]:text-white/85",
              )}
            >
              <ThemeToggle compact />
            </span>
            {showAuthed ? (
              <Link
                href={ROUTES.DASHBOARD}
                className={cn(
                  "px-pad-mol inline-flex h-9 items-center rounded-full text-xs font-semibold shadow-sm",
                  onHero ? "text-primary bg-white" : "bg-primary shadow-primary/25 text-white",
                )}
              >
                {fullName?.split(" ")[0] || "ورود به پنل"}
              </Link>
            ) : (
              <Button
                size="sm"
                onClick={onAuthEntry}
                className="bg-accent px-pad-mol text-foreground hover:bg-accent-hover h-9 rounded-full border-0 text-xs font-semibold"
              >
                ورود و ثبت‌نام
              </Button>
            )}
            <button
              type="button"
              className={cn(
                "relative z-[60] flex size-9 items-center justify-center rounded-full border xl:hidden",
                onHero
                  ? "border-white/30 text-white hover:bg-white/10"
                  : "border-border text-foreground hover:bg-surface-2",
              )}
              aria-label={open ? "بستن منو" : "منو"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="mobile-menu"
            className="fixed inset-0 z-40 xl:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              aria-label="بستن منو"
              className="bg-primary/40 absolute inset-0 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ y: -24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="border-border bg-background p-pad-mol absolute inset-x-4 top-[4.5rem] mx-auto max-h-[min(70dvh,32rem)] max-w-6xl overflow-y-auto rounded-2xl border shadow-2xl sm:inset-x-6 sm:top-[5rem]"
            >
              <ul className="gap-atom flex flex-col">
                {links.map((l, i) => (
                  <motion.li
                    key={l.href}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i, duration: 0.22 }}
                  >
                    <Link
                      href={l.href}
                      className="text-foreground hover:bg-primary/5 hover:text-primary px-pad-mol py-pad-atom-md flex items-center rounded-xl text-sm font-semibold transition"
                      onClick={() => setOpen(false)}
                    >
                      {l.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <div className="border-border mt-mol pt-pad-mol flex items-center justify-between border-t sm:hidden">
                <span className="text-muted text-xs">تم نمایش</span>
                <ThemeToggle compact />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </nav>
  );
}

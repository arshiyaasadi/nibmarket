/**
 * @level organism
 * @spacing internal: gap-mol p-pad-mol | external: none
 */
"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { TypewriterText } from "@/components/molecules/landing/TypewriterText";
import { InviteLeadModal } from "@/components/organisms/landing/InviteLeadModal";

function scrollToCalc() {
  document.getElementById("calc")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

const HERO_TITLE = [
  { text: "تنوین همگام با " },
  { text: "رشد", className: "text-accent" },
  { text: " نوین" },
] as const;

export function LandingHero() {
  const [leadOpen, setLeadOpen] = useState(false);

  return (
    <>
      <header
        id="top"
        className="bg-primary relative -mt-14 flex min-h-[100dvh] flex-col justify-center overflow-hidden pt-14 text-white sm:-mt-16 sm:pt-16"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage: "url(/landing/assets/hero-bg.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="gap-org-md px-pad-mol py-pad-org sm:px-pad-mol-md lg:px-org relative mx-auto grid w-full max-w-6xl flex-1 items-center lg:grid-cols-2">
          <div className="gap-org flex flex-col">
            <h1 className="text-3xl leading-tight font-black sm:text-4xl lg:text-5xl">
              <TypewriterText
                text={[...HERO_TITLE]}
                speedMs={55}
                replayKey="hero-title"
                cursorClassName="bg-accent"
                ariaLabel="تنوین همگام با رشد نوین"
              />
            </h1>
            <div className="gap-atom-md flex flex-wrap items-center text-sm text-white/90">
              <span className="gap-atom inline-flex items-center">
                <b className="flex size-7 items-center justify-center rounded-full bg-white/15 text-xs">
                  ۱
                </b>
                معرفی سرمایه‌گذار
              </span>
              <span className="text-white/50" aria-hidden>
                ←
              </span>
              <span className="gap-atom inline-flex items-center">
                <b className="flex size-7 items-center justify-center rounded-full bg-white/15 text-xs">
                  ۲
                </b>
                دریافت روزانه سکه نقره تنوین
              </span>
            </div>
            <ul className="gap-atom-md flex flex-col text-sm text-white/85">
              <li className="gap-atom-md flex items-center">
                <span className="bg-accent size-1.5 rounded-full" />
                بدون حق عضویت
              </li>
              <li className="gap-atom-md flex items-center">
                <span className="bg-accent size-1.5 rounded-full" />
                بدون نیاز به سرمایه شخصی
              </li>
              <li className="gap-atom-md flex items-center">
                <span className="bg-accent size-1.5 rounded-full" />
                با انواع صندوق‌های سرمایه‌گذاری
              </li>
            </ul>
            <div className="gap-atom-md pt-atom-md flex flex-wrap">
              <Button
                size="lg"
                onClick={() => setLeadOpen(true)}
                className="bg-accent text-foreground hover:bg-accent-hover border-0"
              >
                دریافت لینک ثبت نام
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={scrollToCalc}
                className="border-white/40 text-white hover:bg-white/10"
              >
                محاسبه سهم
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/landing/assets/coin.png"
              alt="سکه نقره تنوین با نشان نوین"
              className="tanvin-float h-auto max-h-[min(48vh,22rem)] w-full max-w-md object-contain drop-shadow-2xl lg:max-h-[min(56vh,28rem)]"
            />
          </div>
        </div>
      </header>

      <InviteLeadModal open={leadOpen} onClose={() => setLeadOpen(false)} />
    </>
  );
}

/**
 * @level organism
 * @spacing internal: gap-mol p-pad-org | external: none
 */
"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { LandingSectionHeader } from "@/components/molecules/landing/LandingSectionHeader";
import { LANDING_FUNDS } from "@/features/landing-tanvin/landing-content";
import { cn } from "@/lib/utils";

export function LandingStrip() {
  return (
    <section className="bg-surface pt-pad-org pb-0">
      <div className="px-pad-mol sm:px-pad-mol-md lg:px-org mx-auto max-w-6xl">
        <div className="border-border bg-background p-pad-mol-md sm:p-pad-org relative overflow-hidden rounded-3xl border">
          <div
            aria-hidden
            className="bg-primary/10 pointer-events-none absolute -start-16 top-1/2 size-56 -translate-y-1/2 rounded-full blur-3xl"
          />
          <div className="gap-org lg:gap-org-md relative grid items-center lg:grid-cols-[minmax(0,11rem)_1fr]">
            <div className="gap-atom flex flex-col items-center lg:items-start">
              <span className="text-primary text-[clamp(4.5rem,14vw,7.5rem)] leading-none font-black tracking-tight">
                ۲٪
              </span>
              <span className="bg-primary/10 text-primary px-pad-atom-md py-pad-atom-xs rounded-full text-[11px] font-bold">
                کارمزد سالانه شبکه
              </span>
            </div>
            <div className="gap-mol flex flex-col text-center lg:text-start">
              <p className="text-foreground text-lg leading-snug font-bold sm:text-xl">
                کارمزد شبکه، مبتنی بر سکه نقره تنوین محاسبه شده و تخصیص می‌یابد.
              </p>
              <p className="text-muted text-sm leading-relaxed sm:text-base">
                از مجموع سرمایه‌گذاری‌های محقق‌شده توسط بازاریابان به صندوق‌های تأمین سرمایه نوین.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingStory() {
  const [open, setOpen] = useState<number | null>(0);

  const items = [
    {
      title: "صندوق‌های نوین",
      body: (
        <div className="gap-mol flex flex-col">
          <p className="text-muted text-sm">
            تأمین سرمایه نوین، نهاد مالی دارای مجوز از سازمان بورس، صندوق‌هایی با سطح‌های مختلف ریسک
            مدیریت می‌کند.
          </p>
          <ul className="gap-atom-md grid grid-cols-1 sm:grid-cols-2">
            {LANDING_FUNDS.map((f) => (
              <li
                key={f.name}
                className="border-border bg-background p-pad-atom-md rounded-xl border"
              >
                <b className="text-foreground text-sm">{f.name}</b>
                <p className="text-muted mt-atom text-xs">{f.desc}</p>
                <p className="text-primary mt-atom-md text-[10px] font-semibold">{f.label}</p>
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      title: "نقش بازاریاب",
      body: (
        <ul className="text-muted gap-atom-md flex flex-col text-sm">
          <li>ثبت‌نام رایگان است و سرمایه شخصی لازم ندارد.</li>
          <li>سهم را نوین می‌پردازد؛ از سود سرمایه‌گذار کم نمی‌شود.</li>
          <li>معرفی فعال: کد ملی جدید، دست‌کم ۱۰ میلیون تومان و ۳۰ روز ماندگاری.</li>
        </ul>
      ),
    },
    {
      title: "سهم نقره‌ای",
      body: (
        <p className="text-muted text-sm leading-relaxed">
          سهم بازاریاب هر روز به سکه تنوین تبدیل و به کیف پول او واریز می‌شود؛ تا زمانی که سرمایه در
          صندوق بماند. از سرمایه هر سه سطح شبکه سهم می‌رسد؛ بیشترین سهم از سطح ۱.
        </p>
      ),
    },
  ];

  return (
    <section id="story" className="bg-surface pt-org pb-pad-org">
      <div className="gap-org px-pad-mol sm:px-pad-mol-md lg:px-org mx-auto flex max-w-6xl flex-col">
        <LandingSectionHeader
          title="همکاری با تنوین، شبکه بازاریابان تأمین سرمایه نوین"
          lead="در تنوین، هر کسی می‌تواند سرمایه‌گذار را به صندوق‌های تأمین سرمایه نوین معرفی کند و در ازای آن، هر روز سهم خود را به‌صورت سکه تنوین با پشتوانه نقره دریافت کند."
        />

        <div className="gap-atom-md flex flex-col">
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={item.title}
                className={cn(
                  "border-border bg-background overflow-hidden rounded-2xl border transition-shadow",
                  isOpen && "shadow-primary/5 shadow-sm",
                )}
              >
                <button
                  type="button"
                  className="hover:bg-surface-2/60 gap-atom-md px-pad-mol py-pad-mol flex w-full items-center text-start transition-colors"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-black transition-colors",
                      isOpen ? "bg-primary text-white" : "bg-primary/10 text-primary",
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="text-foreground min-w-0 flex-1 text-sm font-bold">
                    {item.title}
                  </span>
                  <ChevronDown
                    className={cn(
                      "text-muted size-4 shrink-0 transition-transform duration-300",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      key="body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="border-border px-pad-mol py-pad-mol border-t">
                        {item.body}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="border-border bg-background p-pad-mol rounded-2xl border">
          <h3 className="text-foreground text-base font-bold">تقسیم ۲٪ سالانه میان سه سطح شبکه</h3>
          <p className="text-muted mt-atom text-sm">
            سهم کل شبکه از هر سرمایه معرفی‌شده، ۲ درصد در سال است.
          </p>
          <div className="mt-mol flex h-10 overflow-hidden rounded-xl text-[10px] font-bold text-white sm:text-xs">
            <div className="bg-primary-800 flex w-[60%] items-center justify-center">۶۰٪</div>
            <div className="bg-primary-600 flex w-[20%] items-center justify-center">۲۰٪</div>
            <div className="bg-primary-500 flex w-[10%] items-center justify-center">۱۰٪</div>
            <div className="bg-primary-400 flex w-[10%] items-center justify-center">۱۰٪</div>
          </div>
          <div className="mt-mol gap-atom-md grid grid-cols-2 text-xs sm:grid-cols-4">
            <div>
              <b className="text-primary">۱٫۲٪</b>
              <p className="text-muted">سطح ۱ · معرفی مستقیم</p>
            </div>
            <div>
              <b className="text-primary-600">۰٫۴٪</b>
              <p className="text-muted">سطح ۲</p>
            </div>
            <div>
              <b className="text-primary-500">۰٫۲٪</b>
              <p className="text-muted">سطح ۳</p>
            </div>
            <div>
              <b className="text-primary-500">۰٫۲٪</b>
              <p className="text-muted">استخر ماهانه</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

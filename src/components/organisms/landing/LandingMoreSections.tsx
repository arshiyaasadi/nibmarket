/**
 * @level organism
 * @spacing internal: gap-org p-pad-org | external: none
 */
"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { LandingSectionHeader } from "@/components/molecules/landing/LandingSectionHeader";
import { TypewriterText } from "@/components/molecules/landing/TypewriterText";
import {
  INVITE_MESSAGE,
  LANDING_FAQS,
  LANDING_PERSONAS,
} from "@/features/landing-tanvin/landing-content";
import { cn } from "@/lib/utils";

export function LandingWho() {
  return (
    <section id="who" className="bg-background py-pad-org">
      <div className="gap-org px-pad-mol sm:px-pad-mol-md lg:px-org mx-auto flex max-w-6xl flex-col">
        <LandingSectionHeader
          eyebrow="بازاریابان تأمین سرمایه نوین"
          title="بازاریابی برای کسانی که دیگران به توصیه‌شان اعتماد می‌کنند"
        />
        <ul className="gap-mol grid grid-cols-1 md:grid-cols-3">
          {LANDING_PERSONAS.map((p) => (
            <li
              key={p.who}
              className="border-border bg-surface gap-atom-md p-pad-mol flex flex-col rounded-2xl border"
            >
              <span className="text-primary text-xs font-semibold">{p.who}</span>
              <h3 className="text-foreground text-sm font-bold">{p.h}</h3>
              <p className="text-muted flex-1 text-xs leading-relaxed">{p.d}</p>
              <p className="text-foreground text-xs font-semibold">{p.q}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function LandingInvitee() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(INVITE_MESSAGE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section id="invitee" className="bg-background py-pad-org">
      <div className="gap-org px-pad-mol sm:px-pad-mol-md lg:px-org mx-auto flex max-w-6xl flex-col">
        <LandingSectionHeader
          eyebrow="هدیه سرمایه‌گذاران"
          title="سرمایه‌گذار معرفی‌شده، علاوه بر سود صندوق، سکه تنوین هدیه می‌گیرد"
          lead="سرمایه‌گذاری که با لینک بازاریاب می‌آید، صندوق مناسب خود را انتخاب می‌کند و از همان ابتدا سکه تنوین هدیه می‌گیرد."
        />
        <div className="gap-mol grid lg:grid-cols-2">
          <div className="border-border bg-surface gap-atom-md p-pad-mol grid rounded-2xl border sm:grid-cols-3">
            {[
              {
                b: "۲۰۰ تنوین",
                s: "هدیه شروع سرمایه‌گذاری",
                sm: "احراز هویت، نخستین واریز و ۳۰ روز ماندگاری",
              },
              { b: "۲ تنوین", s: "هر روز ورود به تنوین", sm: "برای دارندگان موجودی" },
              {
                b: "تا ۲۰۰ تنوین",
                s: "هدیه پله‌های موجودی",
                sm: "۵۰، ۱۰۰ و ۲۰۰ تنوین در آستانه‌های دارایی",
              },
            ].map((g) => (
              <div key={g.b} className="bg-background p-pad-atom-md rounded-xl text-center">
                <b className="text-primary text-sm font-black">{g.b}</b>
                <p className="text-foreground mt-atom text-xs font-semibold">{g.s}</p>
                <p className="text-muted mt-atom text-[10px]">{g.sm}</p>
              </div>
            ))}
          </div>
          <div className="border-border bg-surface gap-mol p-pad-mol flex flex-col rounded-2xl border">
            <h3 className="text-foreground text-sm font-bold">پیام آماده معرفی</h3>
            <blockquote className="text-muted text-sm leading-relaxed">{INVITE_MESSAGE}</blockquote>
            <div className="gap-atom-md flex items-center">
              <Button type="button" variant="outline" size="sm" onClick={copy}>
                کپی پیام
              </Button>
              {copied ? (
                <span className="text-success text-xs" role="status">
                  پیام کپی شد.
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingPool() {
  return (
    <section id="pool" className="bg-primary py-pad-org text-white">
      <div className="gap-org px-pad-mol sm:px-pad-mol-md lg:px-org mx-auto flex max-w-6xl flex-col">
        <LandingSectionHeader
          light
          eyebrow="رقابت ماهانه"
          title="هر ماه پنج برنده؛ هر ماه پشتوانه بیشتر برای همه"
          lead="۱۰٪ سهم شبکه هر ماه در استخر جمع می‌شود. رتبه بر اساس میانگین روزانه سرمایه جدیدی است که شبکه بازاریاب آورده و هر ماه از صفر شروع می‌شود."
        />
        <div className="gap-org grid lg:grid-cols-2">
          <div className="gap-atom-md flex flex-col items-center">
            <div className="gap-atom-md flex h-40 items-end">
              {[
                { h: "44%", n: "۴", p: "۸٪" },
                { h: "76%", n: "۲", p: "۱۲٪" },
                { h: "100%", n: "۱", p: "۱۵٪" },
                { h: "62%", n: "۳", p: "۱۰٪" },
                { h: "30%", n: "۵", p: "۵٪" },
              ].map((b) => (
                <div
                  key={b.n}
                  className="pb-atom flex w-10 flex-col items-center justify-end rounded-t-lg bg-white/20 text-[10px] font-bold sm:w-12"
                  style={{ height: b.h }}
                >
                  <b>{b.n}</b>
                  <span>{b.p}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-white/70">سهم پنج بازاریاب برتر ماه از کل استخر</p>
          </div>
          <div id="coin" className="p-pad-mol rounded-2xl border border-white/20 bg-white/10">
            <span className="text-accent text-4xl font-black">۵۰٪</span>
            <h3 className="mt-atom-md text-lg font-bold">
              نیم دیگر، ارزش تنوین همه را بالا می‌برد
            </h3>
            <p className="mt-atom-md text-sm leading-relaxed text-white/85">
              هر تنوین در شروع معادل یک سوت نقره با خلوص ۹۹۹ است و با قیمت نقره حرکت می‌کند. نیمی از
              استخر هر ماه به پشتوانه آن اضافه می‌شود؛ پس هر سکه‌ای که نگه داشته شود، پشتوانه بیشتری
              پیدا می‌کند.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingFaq() {
  const [selected, setSelected] = useState(0);
  const active = LANDING_FAQS[selected] ?? LANDING_FAQS[0]!;

  return (
    <section id="faq" className="bg-surface py-pad-org">
      <div className="gap-org px-pad-mol sm:px-pad-mol-md lg:px-org mx-auto flex max-w-6xl flex-col">
        <LandingSectionHeader eyebrow="پرسش‌های متداول" title="پیش از شروع بازاریابی" />

        <div className="gap-mol flex flex-col">
          <div
            className="border-border bg-background p-pad-mol-md min-h-[8.5rem] rounded-2xl border"
            aria-live="polite"
          >
            <p className="text-primary mb-atom-md text-xs font-bold">{active[0]}</p>
            <p className="text-muted text-sm leading-relaxed sm:text-base">
              <TypewriterText
                key={selected}
                text={active[1]}
                replayKey={selected}
                speedMs={28}
                cursorClassName="bg-primary"
              />
            </p>
          </div>

          <ul className="gap-atom-md grid grid-cols-1 sm:grid-cols-2">
            {LANDING_FAQS.map(([q], i) => {
              const isSelected = selected === i;
              return (
                <li key={q}>
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelected(i)}
                    className={cn(
                      "gap-atom-md px-pad-mol py-pad-mol flex h-full w-full items-start rounded-2xl border text-start transition",
                      isSelected
                        ? "border-primary bg-primary shadow-primary/20 text-white shadow-md"
                        : "border-border bg-background text-foreground hover:border-primary/35 hover:bg-primary/5",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-black",
                        isSelected ? "bg-white/20 text-white" : "bg-primary/10 text-primary",
                      )}
                    >
                      {(i + 1).toLocaleString("fa-IR")}
                    </span>
                    <span className="min-w-0 flex-1 text-sm leading-snug font-semibold">{q}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

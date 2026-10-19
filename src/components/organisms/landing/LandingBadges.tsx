/**
 * @level organism
 * @spacing internal: gap-org p-pad-org | external: none
 */
import { LandingBadgeCard } from "@/components/molecules/landing/LandingBadgeCard";
import { LandingSectionHeader } from "@/components/molecules/landing/LandingSectionHeader";
import {
  LANDING_BADGE_CARDS,
  LANDING_SAFIR_BADGE,
} from "@/features/landing-tanvin/landing-content";

function pn(n: number) {
  return n.toLocaleString("fa-IR");
}

export function LandingBadges() {
  return (
    <section id="badges" className="bg-surface py-pad-org">
      <div className="gap-org px-pad-mol sm:px-pad-mol-md lg:px-org mx-auto flex max-w-6xl flex-col">
        <LandingSectionHeader
          eyebrow="نشان‌ها و سفیر تأمین سرمایه نوین"
          title="بهترین بازاریابان، همکار رسمی تأمین سرمایه نوین می‌شوند"
          lead="چهار نشان، هر کدام جداگانه و به هر ترتیبی. هر نشان یک توانایی را نشان می‌دهد و دو نشان، راه سفیر نوین را باز می‌کند."
        />

        <div className="border-border bg-primary p-pad-mol-md sm:p-pad-org overflow-hidden rounded-2xl border text-white">
          <div className="gap-mol lg:gap-org grid lg:grid-cols-2">
            <div className="gap-atom-md flex flex-col">
              <span className="text-xs font-semibold text-white/70">نشان نهایی</span>
              <h3 className="text-2xl font-black">
                {LANDING_SAFIR_BADGE.title.replace(/^نشان\s+/, "")}
              </h3>
              <div className="gap-atom-md flex flex-wrap">
                <span className="px-pad-atom-md py-pad-atom-xs rounded-full bg-white/15 text-xs">
                  همکار رسمی تأمین سرمایه نوین
                </span>
                <span className="px-pad-atom-md py-pad-atom-xs rounded-full bg-white/15 text-xs">
                  مزایای ویژه همکاری
                </span>
                <span className="bg-accent text-foreground px-pad-atom-md py-pad-atom-xs rounded-full text-xs font-bold">
                  {pn(LANDING_SAFIR_BADGE.reward)} تنوین
                </span>
              </div>
              <p className="text-sm leading-relaxed text-white/85">
                سفیران با قرارداد همکاری، نماینده رسمی تأمین سرمایه نوین می‌شوند و از مزایای ویژه
                همکاری، از جمله سفر و خدمات پشتیبانی VIP، بهره‌مند می‌شوند.
              </p>
            </div>
            <div className="gap-atom-md pt-pad-mol lg:ps-pad-mol flex flex-col border-t border-white/20 lg:border-s lg:border-t-0 lg:pt-0">
              <b className="text-sm font-bold">شرایط سفیر نوین</b>
              <ul className="gap-atom-md flex flex-col text-sm text-white/85">
                {LANDING_SAFIR_BADGE.conditions.map((c) => (
                  <li key={c} className="gap-atom-md flex">
                    <span className="bg-accent mt-2 size-1.5 shrink-0 rounded-full" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <ul className="gap-mol grid grid-cols-2 lg:grid-cols-4">
          {LANDING_BADGE_CARDS.map((badge) => (
            <li key={badge.code}>
              <LandingBadgeCard badge={badge} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

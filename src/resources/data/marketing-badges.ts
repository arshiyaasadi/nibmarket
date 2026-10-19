/**
 * Marketing badges from PDF «تسک های mlm» task 27 (14 Mehr).
 * Images are placeholders until marketing delivers assets.
 */

import type { MarketingBadgeCode } from "@/types/mlm";

export type { MarketingBadgeCode };

export type MarketingBadgeDef = {
  code: MarketingBadgeCode;
  letter: string;
  title: string;
  /** Short summary for cards */
  description: string;
  /** Full conditions shown in detail modal */
  conditions: string[];
  reward: number;
  missionCode: string;
  imageSrc: string | null;
};

export const MARKETING_BADGES: MarketingBadgeDef[] = [
  {
    code: "pishgam",
    letter: "پ",
    title: "نشان پیشگام",
    description: "رسیدن به ۱۰ زیرمجموعه",
    conditions: ["رسیدن به ۱۰ زیرمجموعه"],
    reward: 3000,
    missionCode: "direct_subsets_10",
    imageSrc: null,
  },
  {
    code: "motabar",
    letter: "م",
    title: "نشان معتبر",
    description: "داشتن ۳ زیرمجموعه با دارایی بیش از ۱٫۵ میلیارد تومان در یک ماه",
    conditions: ["داشتن ۳ زیرمجموعه با دارایی بیش از ۱٫۵ میلیارد تومان در یک ماه"],
    reward: 6000,
    missionCode: "subsets_high_aum_1_5b",
    imageSrc: null,
  },
  {
    code: "collector",
    letter: "ک",
    title: "نشان کلکسیونر",
    description: "دارایی شبکه شامل همه صندوق‌ها باشد",
    conditions: ["دارایی شبکه در همه صندوق‌های تأمین سرمایه نوین باشد"],
    reward: 3000,
    missionCode: "network_all_funds",
    imageSrc: null,
  },
  {
    code: "rahbar",
    letter: "ر",
    title: "نشان راهبر",
    description: "۵ زیرمجموعه که هرکدام ۳ زیرمجموعه داشته باشند",
    conditions: ["داشتن ۵ زیرمجموعه که هرکدام حداقل ۳ زیرمجموعه داشته باشند"],
    reward: 10000,
    missionCode: "leader_5x3",
    imageSrc: null,
  },
  {
    code: "safir_novin",
    letter: "س",
    title: "نشان سفیر نوین",
    description: "یکی از مسیرهای سفیر نوین را کامل کنید",
    conditions: [
      "داشتن حداقل دو نشان از چهار نشان پیشگام، معتبر، کلکسیونر و راهبر",
      "یا داشتن ۳۰ زیرمجموعه با مجموع دارایی ۱۰ میلیارد تومان",
      "یا ماندگاری دارایی زیرمجموعه‌ها در طول ۱۲ ماه بیش از ۸۵٪",
      "یا گذراندن دوره آموزشی پیشرفته",
    ],
    reward: 30000,
    missionCode: "badge_safir_novin",
    imageSrc: null,
  },
];

export function getMarketingBadgeByCode(code: string): MarketingBadgeDef | undefined {
  return MARKETING_BADGES.find((b) => b.code === code);
}

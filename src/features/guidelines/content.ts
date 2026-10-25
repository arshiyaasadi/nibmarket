import {
  GUIDELINE_CATEGORY_IDS,
  GUIDELINE_IDS,
  type GuidelineCategory,
  type GuidelineCategoryId,
  type GuidelineId,
  type GuidelineItem,
} from "./types";

export const GUIDELINE_CATEGORIES: GuidelineCategory[] = [
  {
    id: "deposit",
    label: "رسوب",
    description:
      "رسوب یعنی سرمایهٔ معرفی‌شده‌ها در صندوق‌های تأمین سرمایه نوین و قواعد اندازه‌گیری آن.",
  },
  {
    id: "calculation",
    label: "محاسبه سهم",
    description: "فرمول روزانه، نرخ سطوح و اثر واریز و برداشت روی سهم بازاریاب.",
  },
  {
    id: "coins",
    label: "سکه تنوین",
    description: "پشتوانه نقره، نقدشوندگی و نقش ماندگاری در مأموریت‌ها و نشان‌ها.",
  },
  {
    id: "network",
    label: "زیرمجموعه",
    description: "سطوح شبکه، معرفی فعال و قواعد مرتبط با زیرمجموعه‌ها.",
  },
];

const LEVEL_RATES = [
  {
    rate: "۱٫۲٪ در سال",
    desc: "سطح ۱ · سرمایه‌گذارانی که بازاریاب مستقیم معرفی کرده است",
  },
  {
    rate: "۰٫۴٪ در سال",
    desc: "سطح ۲ · سرمایه‌گذارانی که افراد سطح ۱ معرفی کرده‌اند",
  },
  {
    rate: "۰٫۲٪ در سال",
    desc: "سطح ۳ · سرمایه‌گذارانی که افراد سطح ۲ معرفی کرده‌اند",
  },
] as const;

export const GUIDELINE_ITEMS: GuidelineItem[] = [
  {
    id: GUIDELINE_IDS.DEPOSIT_WHAT_IS,
    categoryId: "deposit",
    question: "رسوب چیست؟",
    answer:
      "رسوب به سرمایه‌ای گفته می‌شود که سرمایه‌گذاران معرفی‌شده توسط بازاریاب، در صندوق‌های تأمین سرمایه نوین نگه می‌دارند. سهم بازاریاب هر روز بر اساس مقدار رسوب همان روز محاسبه می‌شود و به‌صورت سکه تنوین به کیف پول او واریز می‌شود.",
    presentation: { type: "text" },
  },
  {
    id: GUIDELINE_IDS.DEPOSIT_HIGHLIGHTS,
    categoryId: "deposit",
    question: "عددهای کلیدی رسوب چیست؟",
    answer:
      "سهم روزانه از نخستین روز واریز می‌شود؛ از سه سطح شبکه محاسبه می‌گردد؛ بدون سقف رشد می‌کند؛ و هر سکه تنوین معادل یک سوت نقره ۹۹۹ است.",
    presentation: {
      type: "highlights",
      items: [
        {
          value: "روزانه",
          desc: "سهم بازاریاب هر روز، از نخستین روز سرمایه‌گذاری، محاسبه و واریز می‌شود.",
        },
        {
          value: "۳ سطح",
          desc: "سهم بازاریاب از رسوب معرفی‌های مستقیم و دو سطح پس از آن محاسبه می‌شود.",
        },
        {
          value: "بدون سقف",
          desc: "با رشد رسوب شبکه، سهم بازاریاب بدون محدودیت افزایش پیدا می‌کند.",
        },
        {
          value: "نقره ۹۹۹",
          desc: "هر سکه تنوین معادل یک سوت نقره با خلوص ۹۹۹ است.",
        },
      ],
    },
  },
  {
    id: GUIDELINE_IDS.DEPOSIT_MEASURE,
    categoryId: "deposit",
    question: "رسوب چگونه اندازه‌گیری می‌شود؟",
    answer:
      "رسوب برابر است با خالص دارایی سرمایه‌گذار معرفی‌شده در همه صندوق‌های تأمین سرمایه نوین، در پایان هر روز. اگر ارزش واحدهای صندوق تغییر کند، رسوب و سهم بازاریاب نیز به همان نسبت تغییر می‌کند.",
    presentation: { type: "text" },
  },
  {
    id: GUIDELINE_IDS.DEPOSIT_NEW_CAPITAL_ONLY,
    categoryId: "deposit",
    question: "آیا انتقال بین صندوق‌های نوین رسوب جدید می‌سازد؟",
    answer:
      "فقط سرمایه‌ای که از بیرون وارد تأمین سرمایه نوین می‌شود، رسوب جدید ایجاد می‌کند. انتقال سرمایه از یک صندوق نوین به صندوق دیگر نوین رسوب جدید ایجاد نمی‌کند، اما رسوب قبلی سرمایه‌گذار را نیز کم نمی‌کند.",
    presentation: { type: "text" },
  },
  {
    id: GUIDELINE_IDS.DEPOSIT_REDEPOSIT,
    categoryId: "deposit",
    question: "واریز دوباره سرمایه‌گذار چه اثری دارد؟",
    answer:
      "هر واریز جدید سرمایه‌گذار، از همان روز به رسوب او اضافه می‌شود و سهم روزانه بازاریاب را افزایش می‌دهد.",
    presentation: { type: "text" },
  },
  {
    id: GUIDELINE_IDS.DEPOSIT_WITHDRAW,
    categoryId: "deposit",
    question: "با برداشت سرمایه، سهم بازاریاب چه می‌شود؟",
    answer:
      "سهم بازاریاب تا آخرین روزی که سرمایه در صندوق باشد، هر روز محاسبه و پرداخت می‌شود. اگر سرمایه‌گذار بخشی از سرمایه را برداشت کند، سهم بازاریاب بر اساس مبلغ باقی‌مانده ادامه پیدا می‌کند.",
    presentation: { type: "text" },
  },
  {
    id: GUIDELINE_IDS.CALC_FORMULA,
    categoryId: "calculation",
    question: "سهم روزانه بازاریاب چگونه محاسبه می‌شود؟",
    answer:
      "رسوب پایان روز × نرخ سالانه سطح ÷ ۳۶۵ ÷ ارزش روز سکه تنوین. نرخ‌ها: سطح ۱ برابر ۱٫۲٪، سطح ۲ برابر ۰٫۴٪ و سطح ۳ برابر ۰٫۲٪ در سال است.",
    presentation: {
      type: "formula",
      lead: "رسوب هر سرمایه‌گذار در پایان روز، در نرخ سالانه سطح او ضرب و بر ۳۶۵ تقسیم می‌شود. مبلغ به‌دست‌آمده با ارزش روز سکه تنوین به سکه تبدیل می‌شود.",
      result: "سهم روزانه بازاریاب (سکه تنوین)",
      factors: ["رسوب پایان روز", "نرخ سالانه سطح", "۳۶۵", "ارزش روز سکه تنوین"],
      rates: [...LEVEL_RATES],
      exampleLabel: "مثال:",
      example:
        "سرمایه‌گذاری در سطح ۱ با ۱۰۵ میلیون تومان رسوب، روزانه حدود ۳٬۴۵۰ تومان سهم برای بازاریاب ایجاد می‌کند؛ با ارزش فعلی سکه تنوین (حدود ۵۲۳ تومان)، این سهم برابر با حدود ۶٫۶ سکه در روز است.",
    },
  },
  {
    id: GUIDELINE_IDS.CALC_FLOW,
    categoryId: "calculation",
    question: "اثر واریز و برداشت بر سهم بازاریاب چگونه است؟",
    answer:
      "هر واریز یا برداشت از همان روز اثر می‌گذارد. با افزایش رسوب سهم بیشتر و با برداشت جزئی بر اساس باقی‌مانده ادامه می‌یابد؛ پس از برداشت کامل، سکه‌های قبلی در کیف پول می‌مانند.",
    presentation: {
      type: "flow",
      lead: "هر واریز یا برداشت سرمایه‌گذار، از همان روز در محاسبه سهم بازاریاب اثر می‌گذارد.",
      chartAria:
        "نمودار نمونه: رسوب ۱۰۰ میلیون، افزایش به ۱۵۰ میلیون، برداشت بخشی به ۱۰۰ میلیون و برداشت کامل",
      steps: [
        {
          amount: "۱۰۰ میلیون",
          barClass: "h-[7.5rem]",
          title: "واریز اول",
          desc: "سرمایه‌گذار ۱۰۰ میلیون تومان واریز می‌کند و سهم بازاریاب از همان روز محاسبه می‌شود.",
        },
        {
          amount: "۱۵۰ میلیون",
          barClass: "h-[11.25rem]",
          title: "واریز دوم",
          desc: "با واریز ۵۰ میلیون تومان دیگر، رسوب به ۱۵۰ میلیون تومان می‌رسد و سهم روزانه بیشتر می‌شود.",
        },
        {
          amount: "۱۰۰ میلیون",
          barClass: "h-[7.5rem]",
          title: "برداشت بخشی",
          desc: "پس از برداشت ۵۰ میلیون تومان، سهم بر اساس ۱۰۰ میلیون تومان باقی‌مانده ادامه پیدا می‌کند.",
        },
        {
          amount: "صفر",
          barClass: "h-1",
          title: "برداشت کامل",
          desc: "سهم تا آخرین روزی که سرمایه در صندوق بوده محاسبه شده و همه سکه‌های واریزشده در کیف پول بازاریاب باقی می‌مانند.",
          empty: true,
        },
      ],
    },
  },
  {
    id: GUIDELINE_IDS.COINS_SILVER,
    categoryId: "coins",
    question: "هر سکه تنوین معادل چیست؟",
    answer: "هر سکه تنوین معادل یک سوت نقره با خلوص ۹۹۹ است.",
    presentation: { type: "stat", value: "نقره ۹۹۹" },
  },
  {
    id: GUIDELINE_IDS.COINS_LOCK,
    categoryId: "coins",
    question: "سکه‌های واریزشده قابل نقد کردن هستند؟",
    answer:
      "همه سکه‌های واریزشده در کیف پول بازاریاب باقی می‌مانند. در شش ماه نخست طرح، سکه‌ها قابل نقد کردن نیستند؛ پس از آن، به معادل ارزش روز نقره خرید و فروش می‌شوند.",
    presentation: { type: "text" },
  },
  {
    id: GUIDELINE_IDS.COINS_RETENTION,
    categoryId: "coins",
    question: "ماندگاری رسوب در مأموریت‌ها و نشان‌ها چه نقشی دارد؟",
    answer:
      "مدت ماندگاری رسوب در مأموریت‌ها و نشان‌ها نیز حساب می‌شود: ۳۰ روز ماندگاری برای فعال شدن معرفی، ۶ و ۱۲ ماه ماندگاری برای پاداش ماندگاری، و ماندگاری دست‌کم ۸۵٪ سرمایه در ۱۲ ماه برای رسیدن به نشان سفیر نوین.",
    presentation: { type: "badges" },
  },
  {
    id: GUIDELINE_IDS.NETWORK_LEVELS,
    categoryId: "network",
    question: "سهم شبکه از چند سطح پرداخت می‌شود؟",
    answer:
      "سهم بازاریاب از سه سطح شبکه محاسبه می‌شود: معرفی مستقیم (سطح ۱) و دو سطح پس از آن. بیشترین سهم مربوط به سطح ۱ است.",
    presentation: {
      type: "rates",
      rates: [...LEVEL_RATES],
    },
  },
  {
    id: GUIDELINE_IDS.NETWORK_ACTIVE_INTRO,
    categoryId: "network",
    question: "معرفی فعال چه شرایطی دارد؟",
    answer:
      "معرفی فعال معمولاً نیازمند کد ملی جدید، دست‌کم ۱۰ میلیون تومان سرمایه‌گذاری و ۳۰ روز ماندگاری است. جزئیات نهایی مطابق قوانین رسمی تنوین اعمال می‌شود.",
    presentation: { type: "text" },
  },
  {
    id: GUIDELINE_IDS.NETWORK_INACTIVITY,
    categoryId: "network",
    question: "اگر زیرمجموعه برای مدتی غیرفعال باشد چه می‌شود؟",
    answer:
      "زیرمجموعه‌هایی که در یک دوره مشخص فعالیتی نداشته باشند مشمول قواعد رسوب و شرایط دعوت‌نامه‌ها می‌شوند. برای آگاهی از جزئیات دقیق، همین صفحه و قوانین رسمی تنوین را ملاک قرار دهید.",
    presentation: { type: "text" },
  },
  {
    id: GUIDELINE_IDS.NETWORK_INVITES,
    categoryId: "network",
    question: "قوانین دعوت‌نامه کجا مشخص می‌شود؟",
    answer:
      "شرایط و محدودیت‌های ارسال دعوت‌نامه (از جمله احراز هویت) در قوانین رسمی تنوین و تنظیمات پنل تعریف می‌شود. برای جزئیات جاری، بخش شبکه و پشتیبانی را هم بررسی کنید.",
    presentation: { type: "text" },
  },
];

const itemById = new Map(GUIDELINE_ITEMS.map((item) => [item.id, item]));

export function isGuidelineCategoryId(value: string): value is GuidelineCategoryId {
  return (GUIDELINE_CATEGORY_IDS as readonly string[]).includes(value);
}

export function getGuidelineCategory(id: GuidelineCategoryId): GuidelineCategory | undefined {
  return GUIDELINE_CATEGORIES.find((c) => c.id === id);
}

export function getGuidelinesByCategory(categoryId: GuidelineCategoryId): GuidelineItem[] {
  return GUIDELINE_ITEMS.filter((item) => item.categoryId === categoryId);
}

export function getGuidelineById(id: GuidelineId): GuidelineItem | undefined {
  return itemById.get(id);
}

export function getGuidelinesByIds(ids: readonly GuidelineId[]): GuidelineItem[] {
  return ids.map((id) => itemById.get(id)).filter((item): item is GuidelineItem => Boolean(item));
}

/** Deep-link helper for the single rules page. */
export function guidelinesHref(categoryId?: GuidelineCategoryId, itemId?: GuidelineId): string {
  const params = new URLSearchParams();
  if (categoryId) params.set("tab", categoryId);
  if (itemId) params.set("q", itemId);
  const qs = params.toString();
  return qs ? `/dashboard/rules?${qs}` : "/dashboard/rules";
}

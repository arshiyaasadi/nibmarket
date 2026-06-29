# Spacing System

سیستم فاصله‌گذاری پروژه بر اساس Atomic Design تعریف شده است. تمام توکن‌ها در `tailwind.config.ts` ثبت‌اند.

## قانون اصلی

> استفاده از اعداد خام Tailwind (`p-4`, `gap-6`, `mt-8`) و مقادیر دلخواه (`p-[13px]`) **ممنوع** است.
> فاصله‌گذاری باید از طریق توکن‌های semantic زیر انجام شود.

---

## توکن‌ها

| توکن | مقدار | کاربرد |
|------|-------|---------|
| `atom` | 4px | فاصله آیکون ↔ متن: `gap-atom` |
| `atom-md` | 8px | فاصله badge ↔ متن: `gap-atom-md` |
| `pad-atom` | 6px | padding داخلی دکمه/chip: `p-pad-atom`, `px-pad-atom` |
| `pad-atom-md` | 12px | padding داخلی اتم (input، سلول جدول): `px-pad-atom-md` |
| `pad-atom-xs` | 2px | micro padding (badge py، دکمه بستن): `py-pad-atom-xs` |
| `mol` | 16px | فاصله اتم‌ها در مولکول: `gap-mol` |
| `mol-md` | 24px | فاصله گرید کارت / padding بزرگ: `gap-mol-md`, `px-mol-md` |
| `pad-mol` | 16px | padding کانتینر مولکول: `p-pad-mol`, `px-pad-mol` |
| `pad-mol-md` | 32px | padding بلوک کارت / فرم: `p-pad-mol-md` |
| `stack-mol` | 20px | فاصله عمودی ردیف‌ها: `p-stack-mol` |
| `org` | 32px | فاصله مولکول‌ها در سکشن: `gap-org` |
| `org-md` | 48px | فاصله ستون‌های سکشن: `gap-org-md` |
| `pad-org` | 48px | padding عمودی سکشن / empty state: `py-pad-org` |
| `pad-org-x` | 64px | padding افقی سکشن: `px-pad-org-x` |
| `stack-org` | 80px | فاصله سکشن ↔ سکشن: `gap-stack-org` |
| `pad-addon` | 36px | offset padding برای آیکون input/select: `pe-pad-addon` |

---

## مثال استفاده

```tsx
// ✅ درست — توکن semantic
<section className="px-pad-org-x py-pad-org">
  <div className="flex flex-col gap-org">
    <Card padding="md">          {/* p-mol-md داخلی */}
      <CardHeader />             {/* mb-pad-mol داخلی */}
      <CardBody>
        <div className="flex gap-atom-md">
          <Icon />
          <span>متن</span>
        </div>
      </CardBody>
    </Card>
  </div>
</section>

// ❌ اشتباه — اعداد خام
<div className="gap-4 p-6 mt-8">
```

---

## قوانین

1. **اعداد خام ممنوع**: `p-4`, `m-2`, `gap-6`, `space-y-8` → ممنوع
2. **مقادیر دلخواه ممنوع**: `p-[13px]`, `gap-[1.5rem]` → ممنوع
3. **فاصله متعلق به parent است**: از `gap-*` روی container استفاده کنید، نه `mb-*` روی فرزند
4. **کامپوننت‌های reusable نباید margin بیرونی داشته باشند**: `mb-*`, `mt-*` بیرون از کامپوننت ممنوع است
5. **هر کامپوننت باید `@level` JSDoc داشته باشد**

---

## اضافه کردن توکن جدید

اگر توکن جدیدی واقعاً نیاز شد:

1. در `tailwind.config.ts` با کامنت px و کاربرد اضافه شود
2. در همین فایل (docs/spacing.md) در جدول توکن‌ها ثبت شود

---

## ESLint

قانون ESLint در `eslint.config.mjs` تعریف شده که موارد زیر را بلاک می‌کند:

```
/\b(p|px|py|pt|pb|ps|pe|m|mx|my|mt|mb|ms|me|gap|space-x|space-y)-(\d+|\[.+\])/
```

برای اجرا:

```bash
npm run lint
```

/**
 * @level organism
 * @spacing internal: gap-atom-md p-pad-mol | external: none
 */
export function LandingFooter() {
  return (
    <footer className="border-border bg-background border-t">
      <div className="text-muted gap-atom-md px-pad-mol py-pad-mol sm:px-pad-mol-md lg:px-org mx-auto flex max-w-6xl flex-col items-center justify-between text-center text-xs sm:flex-row sm:text-start">
        <span>تنوین · شبکه بازاریابان نوین · تأمین سرمایه نوین</span>
        <span className="gap-atom-md flex flex-wrap items-center justify-center">
          <a href="#faq" className="hover:text-foreground transition">
            پرسش‌ها
          </a>
          <span aria-hidden>·</span>
          <a href="#join" className="hover:text-foreground transition">
            پیوستن
          </a>
          <span aria-hidden>·</span>
          <span>پشتیبانی</span>
        </span>
      </div>
    </footer>
  );
}

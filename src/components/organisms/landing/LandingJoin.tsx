/**
 * @level organism
 * @spacing internal: gap-mol p-pad-org | external: none
 */
"use client";

import { useCallback, useState } from "react";
import { Gift, Send } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { ToastContainer, type ToastItem } from "@/components/atoms/Toast";
import { LeadsService } from "@/features/leads/service";
import { isValidIranMobile, mobileToEn } from "@/features/landing-tanvin/landing-calc";

const REGISTRATION_REWARD = 10;

export type LandingJoinProps = {
  /** Optional; join form is lead-capture only (no inline login link). */
  onAuthEntry?: () => void;
};

export function LandingJoin(_props?: LandingJoinProps) {
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [sending, setSending] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  function pushToast(item: Omit<ToastItem, "id">) {
    const id = `join-${Date.now()}`;
    setToasts((prev) => [...prev, { id, ...item }]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = mobileToEn(mobile);
    if (!isValidIranMobile(v)) {
      setError("لطفاً شماره موبایل معتبر (مثل ۰۹۱۲۳۴۵۶۷۸۹) وارد کنید.");
      return;
    }

    setError(undefined);
    setSending(true);

    try {
      await LeadsService.requestRegistrationLink({ mobile: v, source: "landing_join" });
      try {
        sessionStorage.setItem("tanvin_landing_lead_mobile", v);
      } catch {
        /* ignore */
      }
      pushToast({
        variant: "success",
        title: "ارسال شد",
        message: "شماره شما ثبت شد. به‌زودی لینک ثبت‌نام برایتان ارسال می‌شود.",
      });
    } catch {
      pushToast({
        variant: "danger",
        title: "خطا",
        message: "ثبت شماره ممکن نشد. لطفاً دوباره تلاش کنید.",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <section
      id="join"
      className="bg-primary px-pad-mol py-pad-org sm:px-pad-mol-md lg:px-org relative overflow-hidden text-center text-white"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/landing/assets/coin.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -start-8 bottom-0 h-40 w-auto opacity-20 sm:h-56"
      />
      <div className="gap-org relative mx-auto flex max-w-6xl flex-col items-center">
        <div className="gap-mol flex max-w-2xl flex-col items-center">
          <h2 className="text-2xl leading-snug font-black sm:text-3xl">
            همکاری با شبکه تنوین از همین لینک آغاز می‌شود
          </h2>
          <p className="text-sm text-white/80 sm:text-base">
            با ثبت شماره موبایل، لینک معرفی اختصاصی در تنوین ساخته می‌شود. پیوستن رایگان است.
          </p>
          <div className="bg-accent/95 text-foreground gap-atom-md px-pad-mol py-pad-atom-md inline-flex items-center rounded-full text-sm font-bold shadow-lg shadow-black/10">
            <Gift className="size-4 shrink-0" aria-hidden />
            با ثبت‌نام، {REGISTRATION_REWARD.toLocaleString("fa-IR")} سکه تنوین هدیه می‌گیرید
          </div>
        </div>

        <form
          onSubmit={submit}
          className="border-border/10 bg-background p-pad-mol-md w-full max-w-xl rounded-2xl border text-start shadow-2xl shadow-black/20"
          noValidate
        >
          <div className="gap-mol flex flex-col">
            <div>
              <p className="text-foreground text-sm font-bold">شماره موبایل خود را وارد کنید</p>
              <p className="text-muted mt-atom text-xs">
                بعد از ارسال، لینک معرفی برایتان پیامک می‌شود. برای ورود کامل می‌توانید از «ورود و
                ثبت‌نام» استفاده کنید.
              </p>
            </div>

            <div className="gap-atom-md flex flex-col sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1">
                <Input
                  label="شماره موبایل"
                  type="tel"
                  inputMode="tel"
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  autoComplete="tel"
                  value={mobile}
                  onChange={(e) => {
                    setMobile(e.target.value);
                    setError(undefined);
                  }}
                  error={error}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                loading={sending}
                disabled={sending}
                startIcon={!sending ? <Send className="size-4" /> : undefined}
                className="bg-accent text-foreground hover:bg-accent-hover shrink-0 border-0 sm:min-w-[8.5rem]"
              >
                ارسال
              </Button>
            </div>
          </div>
        </form>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </section>
  );
}

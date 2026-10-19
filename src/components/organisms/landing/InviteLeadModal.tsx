/**
 * @level organism
 * @spacing internal: Modal atoms | external: none
 */
"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Modal, ModalBody, ModalFooter } from "@/components/atoms/Modal";
import { LeadsService } from "@/features/leads/service";
import { isValidIranMobile, mobileToEn } from "@/features/landing-tanvin/landing-calc";
import { cn } from "@/lib/utils";

export type InviteLeadModalProps = {
  open: boolean;
  onClose: () => void;
};

export function InviteLeadModal({ open, onClose }: InviteLeadModalProps) {
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState(false);
  const [sending, setSending] = useState(false);

  function handleClose() {
    onClose();
    setMobile("");
    setError(undefined);
    setSuccess(false);
    setSending(false);
  }

  useEffect(() => {
    if (!success) return;
    const t = window.setTimeout(() => handleClose(), 1600);
    return () => window.clearTimeout(t);
    // intentionally close + reset once success sticks
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleClose resets local form state
  }, [success]);

  async function submit() {
    const v = mobileToEn(mobile);
    if (!isValidIranMobile(v)) {
      setError("لطفاً شماره موبایل معتبر (مثل ۰۹۱۲۳۴۵۶۷۸۹) وارد کنید.");
      return;
    }
    setError(undefined);
    setSending(true);
    try {
      await LeadsService.requestRegistrationLink({ mobile: v, source: "landing_hero" });
      try {
        sessionStorage.setItem("tanvin_landing_lead_mobile", v);
      } catch {
        /* ignore */
      }
      setSuccess(true);
    } catch {
      setError("ثبت شماره ممکن نشد. لطفاً دوباره تلاش کنید.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title={success ? undefined : "ثبت نام"} size="sm">
      <ModalBody>
        <div
          className={cn(
            "gap-mol flex flex-col transition-all duration-300",
            success && "py-pad-mol items-center text-center",
          )}
        >
          {success ? (
            <>
              <CheckCircle2 className="text-success size-14" />
              <p className="text-foreground text-base font-bold">با موفقیت ثبت شد</p>
              <p className="text-muted text-sm">به‌زودی لینک ثبت‌نام برای شما ارسال می‌شود.</p>
            </>
          ) : (
            <>
              <p className="text-muted text-sm">
                برای دریافت لینک دعوت شماره همراه خود را وارد کنید
              </p>
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
                required
              />
            </>
          )}
        </div>
      </ModalBody>
      {!success ? (
        <ModalFooter>
          <Button type="button" variant="ghost" onClick={handleClose} disabled={sending}>
            انصراف
          </Button>
          <Button type="button" onClick={() => void submit()} loading={sending} disabled={sending}>
            ثبت شماره
          </Button>
        </ModalFooter>
      ) : null}
    </Modal>
  );
}

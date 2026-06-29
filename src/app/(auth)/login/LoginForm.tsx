"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthActions } from "@/store/hooks/use-auth";
import { ROUTES } from "@/config/routes";
import { redirectToPanelLogin } from "@/config/auth-redirect";
import { MOCK_PASSWORD } from "@/config/mock-hints";
import { BFF_API_BASE } from "@/lib/api/endpoints";
import { normalizeMobile, normalizeOtp, normalizeSearchInput } from "@/lib/normalization/digits";
import { OtpInput } from "./OtpInput";
import type { UserRole } from "@/types/mlm";

const OTP_EXPIRY = 120;

const VALID_STEPS = [
  "phone",
  "password",
  "otp",
  "register-otp",
  "register-password",
  "forgot-otp",
  "forgot-reset",
  "forgot-done",
] as const;
type Step = (typeof VALID_STEPS)[number];

class FormApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "FormApiError";
  }
}

function isMobileValid(v: string) {
  return /^09\d{9}$/.test(v);
}

export function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthActions();

  const initialStep = (() => {
    const s = searchParams.get("step");
    return (VALID_STEPS as readonly string[]).includes(s ?? "") ? (s as Step) : "phone";
  })();

  const [step, setStepState] = useState<Step>(initialStep);
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState(MOCK_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showInviteCode, setShowInviteCode] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [registrationToken, setRegistrationToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(OTP_EXPIRY);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (step !== "otp" && step !== "register-otp" && step !== "forgot-otp") return;
    const id = setInterval(() => {
      setResendTimer((s) => {
        if (s <= 1) { clearInterval(id); setCanResend(true); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [step]);

  function setStep(next: Step) {
    if (next === "otp" || next === "register-otp" || next === "forgot-otp") {
      setResendTimer(OTP_EXPIRY);
      setCanResend(false);
    }
    setStepState(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next === "phone") params.delete("step");
    else params.set("step", next);
    router.replace(`/login${params.size ? `?${params}` : ""}`, { scroll: false });
  }

  function setError(field: string, msg: string) {
    setFieldErrors((prev) => ({ ...prev, [field]: msg }));
  }
  function clearError(field?: string) {
    if (field) setFieldErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    else setFieldErrors({});
  }

  async function post(path: string, body: object) {
    const res = await fetch(`${BFF_API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new FormApiError(
        res.status,
        String(data.error ?? "error"),
        String(data.message ?? data.error ?? "error"),
      );
    }
    return res.json();
  }

  function onAuthSuccess(data: {
    token: string; refreshToken: string; role: UserRole;
    userId: string; fullName: string; mobile?: string;
    email?: string; inviteCode?: string; referralCode?: string;
    balance?: number; recentSessions?: unknown[];
  }) {
    setAuth({
      token: data.token,
      refreshToken: data.refreshToken,
      role: data.role,
      userId: data.userId,
      fullName: data.fullName,
      mobile: data.mobile,
      email: data.email,
      inviteCode: data.inviteCode ?? data.referralCode,
      balance: data.balance,
      recentSessions: (data.recentSessions as never[]) ?? [],
    });
    router.push(searchParams.get("redirect") ?? ROUTES.DASHBOARD);
    router.refresh();
  }

  async function handlePhoneNext(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    if (!isMobileValid(mobile)) { setError("mobile", t("invalidMobile")); return; }
    setLoading(true);
    try {
      const data = await post("/auth/check-mobile", { mobile }) as { exists: boolean };
      if (data.exists) {
        setStep("password");
      } else {
        await post("/auth/register/otp/send", { mobile });
        setOtpCode("");
        setStep("register-otp");
      }
    } catch {
      setError("mobile", t("invalidMobile"));
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    setLoading(true);
    try {
      const data = await post("/auth/login", { mobile, password });
      onAuthSuccess(data);
    } catch {
      setError("password", t("invalidCredentials"));
    } finally {
      setLoading(false);
    }
  }

  async function sendOtp(forgotMode = false) {
    clearError();
    setLoading(true);
    try {
      await post(forgotMode ? "/auth/forgot/send" : "/auth/otp/send", { mobile });
      setOtpCode("");
      setStep(forgotMode ? "forgot-otp" : "otp");
    } catch {
      setError("otp", t("invalidCredentials"));
    } finally {
      setLoading(false);
    }
  }

  async function sendRegisterOtp() {
    clearError();
    setLoading(true);
    try {
      await post("/auth/register/otp/send", { mobile });
      setOtpCode("");
      setStep("register-otp");
    } catch {
      setError("otp", t("invalidCredentials"));
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpVerify(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    if (otpCode.length < 6) return;
    setLoading(true);
    try {
      const data = await post("/auth/otp/verify", { mobile, code: otpCode });
      onAuthSuccess(data);
    } catch {
      setError("otp", t("invalidOtp"));
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterOtpVerify(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    if (otpCode.length < 6) return;
    setLoading(true);
    try {
      const data = await post("/auth/register/otp/verify", { mobile, code: otpCode }) as {
        registrationToken: string;
      };
      setRegistrationToken(data.registrationToken);
      setNewPassword(MOCK_PASSWORD);
      setConfirmPassword(MOCK_PASSWORD);
      setStep("register-password");
    } catch {
      setError("otp", t("invalidOtp"));
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    if (newPassword !== confirmPassword) { setError("confirmPassword", t("passwordMismatch")); return; }
    setLoading(true);
    try {
      const data = await post("/auth/register", {
        mobile,
        password: newPassword,
        registrationToken,
        referralCode: inviteCode || undefined,
      });
      onAuthSuccess(data);
    } catch (error) {
      const errorText = error instanceof FormApiError
        ? `${error.code} ${error.message}`.toLowerCase()
        : "";

      if (errorText.includes("referral")) {
        setError("inviteCode", t("invalidReferralCode"));
        return;
      }

      if (errorText.includes("already_registered")) {
        setError("mobile", t("alreadyRegistered"));
        setStep("password");
        return;
      }

      setError("newPassword", t("registrationFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotOtpVerify(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    if (otpCode.length < 6) return;
    setLoading(true);
    try {
      await post("/auth/forgot/verify", { mobile, code: otpCode });
      setStep("forgot-reset");
    } catch {
      setError("otp", t("invalidOtp"));
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotReset(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    if (newPassword !== confirmPassword) { setError("confirmPassword", t("passwordMismatch")); return; }
    setLoading(true);
    try {
      await post("/auth/forgot/reset", { mobile, newPassword });
      setStep("forgot-done");
    } catch {
      setError("newPassword", t("invalidCredentials"));
    } finally {
      setLoading(false);
    }
  }

  async function handleNibMarketLogin() {
    clearError();
    setLoading(true);
    redirectToPanelLogin(searchParams.get("returnUrl") ?? searchParams.get("redirect") ?? ROUTES.DASHBOARD);
  }

  // ─── Shared input class ──────────────────────────────────────
  const inputCls = (field: string) =>
    cn(
      "w-full h-control-h rounded-lg border-2 bg-surface px-pad-atom-md text-sm placeholder:text-xs placeholder:text-muted focus:outline-none transition-colors",
      fieldErrors[field] ? "border-danger focus:border-danger" : "border-border focus:border-primary",
    );

  const fieldError = (field: string) =>
    fieldErrors[field] ? (
      <p className="text-xs text-danger">{fieldErrors[field]}</p>
    ) : null;

  // ─── Render ──────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-pad-mol">

      {step === "phone" && (
        <p className="text-center text-sm text-muted">{t("loginDescription")}</p>
      )}

      {/* ── Step: phone ── */}
      {step === "phone" && (
        <form onSubmit={handlePhoneNext} className="flex flex-col gap-pad-mol">
          <div className="flex flex-col gap-atom-md">
            <label className="text-sm font-medium text-foreground">{t("mobile")}</label>
            <input
              type="tel"
              inputMode="numeric"
              value={mobile}
              onChange={(e) => { setMobile(normalizeMobile(e.target.value)); clearError("mobile"); }}
              placeholder={t("mobilePlaceholder")}
              dir="ltr"
              className={cn(inputCls("mobile"), "text-center tracking-widest")}
            />
            {fieldError("mobile")}
          </div>

          <button
            type="button"
            onClick={() => setShowInviteCode((s) => !s)}
            className="self-start text-xs text-primary hover:underline"
          >
            {t("haveInviteCode")}
          </button>

          {showInviteCode && (
            <div className="flex flex-col gap-atom-md">
              <label className="text-sm font-medium text-foreground">{t("inviteCode")}</label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(normalizeSearchInput(e.target.value).toUpperCase())}
                dir="ltr"
                className={cn(inputCls("inviteCode"), "uppercase tracking-widest")}
              />
              {fieldError("inviteCode")}
            </div>
          )}

          <button
            type="submit"
            className="w-full h-control-h rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-50"
          >
            {t("nextButton")}
          </button>

          <div className="relative flex items-center gap-atom-md">
            <div className="flex-1 border-t border-border" />
            <span className="text-xs text-muted">{t("orSeparator")}</span>
            <div className="flex-1 border-t border-border" />
          </div>

          <button
            type="button"
            onClick={handleNibMarketLogin}
            disabled={loading}
            className="flex w-full h-control-h items-center justify-center gap-atom-md rounded-lg border-2 border-primary bg-primary/5 text-sm font-semibold text-primary hover:bg-primary/10 disabled:opacity-50"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/nib-market-logo.svg"
              alt=""
              aria-hidden="true"
              className="h-5 w-auto shrink-0 brightness-0 invert"
            />
            {t("loginWithNibMarket")}
          </button>
          {fieldError("nibMarket")}
        </form>
      )}

      {/* ── Step: OTP (registration) ── */}
      {step === "register-otp" && (
        <form onSubmit={handleRegisterOtpVerify} className="flex flex-col gap-pad-mol">
          <div className="flex items-center gap-atom-md">
            <button type="button" onClick={() => setStep("phone")} className="text-muted hover:text-foreground">
              <ChevronRight className="size-5" />
            </button>
            <div className="flex flex-col gap-pad-atom-xs">
              <p className="text-sm font-medium text-foreground">{t("registerTitle")}</p>
              <p className="text-sm text-muted">{t("otpSentTo", { mobile })}</p>
            </div>
          </div>

          <OtpInput value={otpCode} onChange={(value) => setOtpCode(normalizeOtp(value))} disabled={loading} />
          {fieldError("otp")}

          <ResendButton canResend={canResend} timer={resendTimer} onResend={sendRegisterOtp} t={t} />

          <button
            type="submit"
            disabled={loading || otpCode.length < 6}
            className="w-full h-control-h rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-50"
          >
            {loading ? "..." : t("nextButton")}
          </button>
        </form>
      )}

      {/* ── Step: registration password ── */}
      {step === "register-password" && (
        <form onSubmit={handleRegister} className="flex flex-col gap-pad-mol">
          <div className="flex items-center gap-atom-md">
            <button type="button" onClick={() => setStep("register-otp")} className="text-muted hover:text-foreground">
              <ChevronRight className="size-5" />
            </button>
            <p className="text-sm font-medium text-foreground">{t("registerPasswordTitle")}</p>
          </div>

          <PasswordField
            label={t("password")}
            field="newPassword"
            value={newPassword}
            onChange={(v) => { setNewPassword(v); clearError("newPassword"); }}
            visible={showRegisterPassword}
            onToggleVisible={() => setShowRegisterPassword((s) => !s)}
            inputCls={inputCls}
            error={fieldErrors.newPassword}
            showPasswordLabel={t("showPassword")}
            hidePasswordLabel={t("hidePassword")}
          />

          <PasswordField
            label={t("registerConfirmPassword")}
            field="confirmPassword"
            value={confirmPassword}
            onChange={(v) => { setConfirmPassword(v); clearError("confirmPassword"); }}
            visible={showRegisterConfirm}
            onToggleVisible={() => setShowRegisterConfirm((s) => !s)}
            inputCls={inputCls}
            error={fieldErrors.confirmPassword}
            showPasswordLabel={t("showPassword")}
            hidePasswordLabel={t("hidePassword")}
          />

          <div className="flex flex-col gap-atom-md">
            <label className="text-sm font-medium text-foreground">{t("inviteCode")}</label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => { setInviteCode(normalizeSearchInput(e.target.value).toUpperCase()); clearError("inviteCode"); }}
              dir="ltr"
              className={cn(inputCls("inviteCode"), "uppercase tracking-widest")}
            />
            {fieldError("inviteCode")}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-control-h rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-50"
          >
            {loading ? "..." : t("registerButton")}
          </button>
        </form>
      )}

      {/* ── Step: password ── */}
      {step === "password" && (
        <form onSubmit={handlePasswordLogin} className="flex flex-col gap-pad-mol">
          <div className="flex items-center gap-atom-md">
            <button type="button" onClick={() => setStep("phone")} className="text-muted hover:text-foreground">
              <ChevronRight className="size-5" />
            </button>
            <span className="text-sm text-muted" dir="ltr">{mobile}</span>
          </div>

          <div className="flex flex-col gap-atom-md">
            <label className="text-sm font-medium text-foreground">{t("password")}</label>
            <div className="relative" dir="rtl">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
                dir="ltr"
                className={cn(inputCls("password"), "ps-pad-addon")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                tabIndex={-1}
                className="absolute inset-y-0 start-0 flex items-center ps-pad-atom-md text-muted hover:text-foreground"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {fieldError("password")}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => sendOtp(true)}
              className="text-xs text-muted hover:text-primary hover:underline"
            >
              {t("forgotPassword")}
            </button>
            <button
              type="button"
              onClick={() => sendOtp(false)}
              disabled={loading}
              className="text-xs text-primary hover:underline"
            >
              {t("loginWithOtp")}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-control-h rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-50"
          >
            {loading ? "..." : t("loginButton")}
          </button>
        </form>
      )}

      {/* ── Step: OTP (login) ── */}
      {step === "otp" && (
        <form onSubmit={handleOtpVerify} className="flex flex-col gap-pad-mol">
          <div className="flex items-center gap-atom-md">
            <button type="button" onClick={() => setStep("password")} className="text-muted hover:text-foreground">
              <ChevronRight className="size-5" />
            </button>
            <p className="text-sm text-muted">{t("otpSentTo", { mobile })}</p>
          </div>

          <OtpInput value={otpCode} onChange={setOtpCode} disabled={loading} />
          {fieldError("otp")}

          <ResendButton canResend={canResend} timer={resendTimer} onResend={() => sendOtp(false)} t={t} />

          <button
            type="submit"
            disabled={loading || otpCode.length < 6}
            className="w-full h-control-h rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-50"
          >
            {loading ? "..." : t("loginButton")}
          </button>
        </form>
      )}

      {/* ── Step: OTP (forgot password) ── */}
      {step === "forgot-otp" && (
        <form onSubmit={handleForgotOtpVerify} className="flex flex-col gap-pad-mol">
          <div className="flex items-center gap-atom-md">
            <button type="button" onClick={() => setStep("password")} className="text-muted hover:text-foreground">
              <ChevronRight className="size-5" />
            </button>
            <p className="text-sm font-medium text-foreground">{t("forgotPasswordTitle")}</p>
          </div>

          <p className="text-center text-sm text-muted">{t("otpSentTo", { mobile })}</p>

          <OtpInput value={otpCode} onChange={setOtpCode} disabled={loading} />
          {fieldError("otp")}

          <ResendButton canResend={canResend} timer={resendTimer} onResend={() => sendOtp(true)} t={t} />

          <button
            type="submit"
            disabled={loading || otpCode.length < 6}
            className="w-full h-control-h rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-50"
          >
            {loading ? "..." : t("nextButton")}
          </button>
        </form>
      )}

      {/* ── Step: new password ── */}
      {step === "forgot-reset" && (
        <form onSubmit={handleForgotReset} className="flex flex-col gap-pad-mol">
          <p className="text-center text-sm font-medium text-foreground">{t("forgotPasswordTitle")}</p>

          <PasswordField
            label={t("newPassword")}
            field="newPassword"
            value={newPassword}
            onChange={(v) => { setNewPassword(v); clearError("newPassword"); }}
            visible={showResetPassword}
            onToggleVisible={() => setShowResetPassword((s) => !s)}
            inputCls={inputCls}
            error={fieldErrors.newPassword}
            showPasswordLabel={t("showPassword")}
            hidePasswordLabel={t("hidePassword")}
          />

          <PasswordField
            label={t("resetConfirmPassword")}
            field="confirmPassword"
            value={confirmPassword}
            onChange={(v) => { setConfirmPassword(v); clearError("confirmPassword"); }}
            visible={showResetConfirm}
            onToggleVisible={() => setShowResetConfirm((s) => !s)}
            inputCls={inputCls}
            error={fieldErrors.confirmPassword}
            showPasswordLabel={t("showPassword")}
            hidePasswordLabel={t("hidePassword")}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full h-control-h rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-50"
          >
            {loading ? "..." : t("submitReset")}
          </button>
        </form>
      )}

      {/* ── Step: forgot done ── */}
      {step === "forgot-done" && (
        <div className="flex flex-col items-center gap-pad-mol text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-success/10 text-3xl text-success">
            ✓
          </div>
          <p className="text-sm font-medium text-foreground">{t("passwordResetSuccess")}</p>
          <button
            type="button"
            onClick={() => { setStep("password"); setPassword(""); }}
            className="w-full rounded-lg bg-primary py-atom-md text-sm font-semibold text-white hover:bg-primary-600"
          >
            {t("loginButton")}
          </button>
        </div>
      )}
    </div>
  );
}

function PasswordField({
  label,
  field,
  value,
  onChange,
  visible,
  onToggleVisible,
  inputCls,
  error,
  showPasswordLabel,
  hidePasswordLabel,
}: {
  label: string;
  field: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggleVisible: () => void;
  inputCls: (field: string) => string;
  error?: string;
  showPasswordLabel: string;
  hidePasswordLabel: string;
}) {
  return (
    <div className="flex flex-col gap-atom-md">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="relative" dir="rtl">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          dir="ltr"
          autoComplete="new-password"
          className={cn(inputCls(field), "ps-pad-addon")}
        />
        <button
          type="button"
          onClick={onToggleVisible}
          tabIndex={-1}
          aria-label={visible ? hidePasswordLabel : showPasswordLabel}
          className="absolute inset-y-0 start-0 flex items-center ps-pad-atom-md text-muted hover:text-foreground"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}

function ResendButton({
  canResend, timer, onResend, t,
}: {
  canResend: boolean; timer: number;
  onResend: () => void; t: (key: string, opts?: Record<string, string | number | Date>) => string;
}) {
  return (
    <div className="text-center">
      {canResend ? (
        <button type="button" onClick={onResend} className="text-xs text-primary hover:underline">
          {t("resendCode")}
        </button>
      ) : (
        <span className="text-xs text-muted">{t("resendIn", { seconds: timer })}</span>
      )}
    </div>
  );
}

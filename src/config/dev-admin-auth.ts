import { normalizeMobile, normalizeOtp } from "@/lib/normalization/digits";

/**
 * Temporary dev-only admin login via the regular mobile OTP flow.
 * TODO(backend-admin-auth): Remove once backend supports admin OTP login.
 */
export const DEV_ADMIN = {
  id: "dev-admin-virtual",
  mobile: "09173648291",
  otp: "5829",
  fullName: "مدیر توسعه",
  email: "dev-admin@nibclub.local",
  role: "admin" as const,
};

export function isDevAdminAuthEnabled(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.ENABLE_DEV_ADMIN_LOGIN === "1";
}

export function isDevAdminMobile(mobile: string): boolean {
  return normalizeMobile(mobile) === DEV_ADMIN.mobile;
}

export function isDevAdminOtp(code: string): boolean {
  return normalizeOtp(code) === DEV_ADMIN.otp;
}

export function isDevAdminId(userId: string): boolean {
  return userId === DEV_ADMIN.id;
}

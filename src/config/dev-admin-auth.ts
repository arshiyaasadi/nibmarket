import { DEV_ADMIN_LOGIN } from "@/config/mock-hints";

/**
 * Temporary dev-only admin account for POST /admin/auth/login.
 * TODO(backend-admin-auth): Replace with backend admin user store.
 */
export const DEV_ADMIN = {
  id: "dev-admin-virtual",
  username: process.env.DEV_ADMIN_USERNAME ?? DEV_ADMIN_LOGIN.username,
  password: process.env.DEV_ADMIN_PASSWORD ?? DEV_ADMIN_LOGIN.password,
  fullName: DEV_ADMIN_LOGIN.fullName,
  email: DEV_ADMIN_LOGIN.email,
  mobile: DEV_ADMIN_LOGIN.mobile,
  role: "admin" as const,
};

export function isDevAdminAuthEnabled(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.ENABLE_DEV_ADMIN_LOGIN === "1";
}

export function isDevAdminUsername(username: string): boolean {
  return username.trim().toLowerCase() === DEV_ADMIN.username.trim().toLowerCase();
}

export function isDevAdminPassword(password: string): boolean {
  return password === DEV_ADMIN.password;
}

export function isDevAdminId(userId: string): boolean {
  return userId === DEV_ADMIN.id;
}

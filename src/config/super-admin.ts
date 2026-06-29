// Server-only — never import on client
export const SUPER_ADMIN = {
  email: process.env.SUPER_ADMIN_EMAIL ?? "superadmin@nibclub.ir",
  password: process.env.SUPER_ADMIN_PASSWORD ?? "NibAdmin@1403",
  name: "Super Admin",
  id: "super-admin-virtual",
} as const;

export function isSuperAdminId(userId: string): boolean {
  return userId === SUPER_ADMIN.id;
}

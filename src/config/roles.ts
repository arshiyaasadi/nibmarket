import type { UserRole } from "@/types/mlm";

export function numericToRole(n: number): UserRole {
  if (n === 2) return "manager";
  if (n >= 3) return "admin";
  return "client";
}

// Route → allowed roles. Absent key = public.
export const ROLE_GUARDS: Record<string, UserRole[]> = {
  "/dashboard": ["client", "manager", "admin"],
  "/dashboard/network": ["client"],
  "/dashboard/wallet": ["client"],
  "/dashboard/subset-deposits": ["client"],
  "/dashboard/reports/subsets": ["client"],
  "/dashboard/reports/income": ["client"],
  "/dashboard/leaderboard": ["client"],
  "/dashboard/missions": ["client"],
  "/dashboard/capital": ["client"],
  "/dashboard/notifications": ["client"],
  "/dashboard/competition/participate": ["client"],
  "/dashboard/competition/records": ["client"],
  "/dashboard/competition/prizes": ["client"],
  "/dashboard/rules": ["client"],
  "/dashboard/support": ["client"],
};

export const ADMIN_ROLE_GUARDS: Record<string, UserRole[]> = {
  "/admin": ["manager", "admin"],
  "/admin/users": ["manager", "admin"],
  "/admin/network": ["manager", "admin"],
  "/admin/missions": ["manager", "admin"],
  "/admin/admins": ["admin"],
  "/admin/reports": ["admin"],
};

export function canAccess(path: string, role: UserRole): boolean {
  const allowed = ROLE_GUARDS[path] ?? ADMIN_ROLE_GUARDS[path];
  if (!allowed) return true;
  return allowed.includes(role);
}

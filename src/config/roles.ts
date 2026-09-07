import type { UserRole } from "@/types/mlm";

export function numericToRole(n: number): UserRole {
  if (n === 2) return "manager";
  if (n >= 3) return "admin";
  return "client";
}

/** Panel (client app) routes — managers/admins may also browse them. */
const PANEL_ROLES: UserRole[] = ["client", "manager", "admin"];

// Route → allowed roles. Absent key = public.
export const ROLE_GUARDS: Record<string, UserRole[]> = {
  "/dashboard": PANEL_ROLES,
  "/dashboard/network": PANEL_ROLES,
  "/dashboard/wallet": PANEL_ROLES,
  "/dashboard/subset-deposits": PANEL_ROLES,
  "/dashboard/reports/subsets": PANEL_ROLES,
  "/dashboard/reports/income": PANEL_ROLES,
  "/dashboard/leaderboard": PANEL_ROLES,
  "/dashboard/missions": PANEL_ROLES,
  "/dashboard/capital": PANEL_ROLES,
  "/dashboard/notifications": PANEL_ROLES,
  "/dashboard/competition/participate": PANEL_ROLES,
  "/dashboard/competition/records": PANEL_ROLES,
  "/dashboard/competition/prizes": PANEL_ROLES,
  "/dashboard/rules": PANEL_ROLES,
  "/dashboard/support": PANEL_ROLES,
};

export const ADMIN_ROLE_GUARDS: Record<string, UserRole[]> = {
  "/admin": ["manager", "admin"],
  "/admin/users": ["manager", "admin"],
  "/admin/network": ["manager", "admin"],
  "/admin/missions": ["manager", "admin"],
  "/admin/twin": ["manager", "admin"],
  "/admin/pool": ["manager", "admin"],
  "/admin/sediment": ["manager", "admin"],
  "/admin/notifications": ["manager", "admin"],
  "/admin/map": ["manager", "admin"],
  "/admin/reports": ["admin"],
};

export function isAdminRole(role: UserRole): boolean {
  return role === "admin" || role === "manager";
}

export function canAccess(path: string, role: UserRole): boolean {
  const allowed = resolveAllowedRoles(path);
  if (!allowed) return true;
  return allowed.includes(role);
}

/** Resolve route guard — exact match first, then admin sub-route prefixes. */
export function resolveAllowedRoles(pathname: string): UserRole[] | undefined {
  const allGuards = { ...ROLE_GUARDS, ...ADMIN_ROLE_GUARDS };
  if (allGuards[pathname]) return allGuards[pathname];

  if (pathname.startsWith("/admin/users/") && pathname !== "/admin/users/demographics") {
    return ADMIN_ROLE_GUARDS["/admin/users"];
  }

  return undefined;
}

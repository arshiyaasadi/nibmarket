"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Network, Target, Shield, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { performLogout } from "@/lib/auth/session";

const NAV = [
  { href: "/admin", label: "داشبورد", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "کاربران", icon: Users, exact: false },
  { href: "/admin/network", label: "شبکه", icon: Network, exact: false },
  { href: "/admin/missions", label: "مأموریت‌ها", icon: Target, exact: false },
  { href: "/admin/admins", label: "مدیران", icon: Shield, exact: false },
];

export function AdminSidebar() {
  const pathname = usePathname();
  async function handleLogout() {
    await performLogout("/admin/login");
  }

  return (
    <aside
      className="border-border bg-surface fixed start-0 top-0 z-40 flex h-screen w-56 flex-col border-e"
      dir="rtl"
    >
      {/* Logo */}
      <div className="border-border flex h-14 items-center border-b px-4">
        <span className="text-primary text-sm font-bold">NIB Club</span>
        <span className="bg-primary/10 text-primary ms-2 rounded-md px-2 py-0.5 text-[11px] font-semibold">
          ADMIN
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted hover:bg-background hover:text-foreground",
              )}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-border border-t p-3">
        <button
          onClick={handleLogout}
          className="text-muted hover:bg-background flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:text-red-500"
        >
          <LogOut size={17} />
          خروج
        </button>
      </div>
    </aside>
  );
}

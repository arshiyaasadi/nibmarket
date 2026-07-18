"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Coins, LayoutGrid, Network, Shield, Target, User, Wallet } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { ROUTES } from "@/config/routes";
import type { AdminUserProfileResponse, AdminUserStatus } from "@/types/admin";

const STATUS_LABELS: Record<AdminUserStatus, string> = {
  active: "فعال",
  suspended: "تعلیق",
  pending_verification: "در انتظار تأیید",
  closed: "بسته",
};

const KYC_LABELS = {
  none: "—",
  pending: "در انتظار",
  verified: "تأیید شده",
  rejected: "رد شده",
} as const;

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-border flex items-start justify-between gap-4 border-b py-3 last:border-0">
      <span className="text-muted shrink-0 text-xs">{label}</span>
      <span className="text-foreground text-start text-sm">{value}</span>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-border bg-surface rounded-2xl border p-4">
      <p className="text-muted text-xs">{label}</p>
      <p className="text-foreground mt-2 text-xl font-bold tabular-nums">
        {typeof value === "number" ? value.toLocaleString("fa-IR") : value}
      </p>
    </div>
  );
}

export default function UserProfileContent({ userId }: { userId: string }) {
  const { data, isLoading, isError } = useQuery<AdminUserProfileResponse>({
    queryKey: ["admin", "users", "detail", userId],
    queryFn: () => apiClient.get(ENDPOINTS.ADMIN.USERS.DETAIL(userId)),
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-foreground font-medium">کاربر یافت نشد</p>
        <Link href={ROUTES.ADMIN.USERS} className="text-primary text-sm hover:underline">
          بازگشت به لیست کاربران
        </Link>
      </div>
    );
  }

  const {
    user,
    wallet,
    subordinates,
    modules,
    subsetDeposits,
    missionProgress,
    recentSessions,
    referrer,
  } = data;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={ROUTES.ADMIN.USERS}
            className="text-muted hover:text-foreground mb-3 inline-flex items-center gap-1 text-xs transition-colors"
          >
            <ArrowRight size={14} />
            بازگشت به کاربران
          </Link>
          <h1 className="text-foreground text-xl font-bold">{user.fullName}</h1>
          <p className="text-muted mt-1 text-xs">پروفایل کاربر — نمای ادمین</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            user.status === "active"
              ? "bg-green-500/10 text-green-600"
              : user.status === "suspended"
                ? "bg-red-500/10 text-red-600"
                : "bg-yellow-500/10 text-yellow-600"
          }`}
        >
          {STATUS_LABELS[user.status]}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatTile label="موجودی کل TWIN" value={wallet.totalTokens} />
        <StatTile label="موجودی قابل برداشت" value={wallet.availableTokens} />
        <StatTile label="زیرمجموعه مستقیم" value={data.directSubordinatesCount} />
        <StatTile label="کل شبکه" value={data.totalNetworkSize} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="border-border bg-surface rounded-2xl border p-5 xl:col-span-1">
          <div className="mb-4 flex items-center gap-2">
            <User size={18} className="text-primary" />
            <h2 className="text-foreground text-sm font-semibold">اطلاعات کاربر</h2>
          </div>
          <InfoRow label="نام" value={user.fullName} />
          <InfoRow label="موبایل" value={<span dir="ltr">{user.mobile}</span>} />
          <InfoRow label="ایمیل" value={<span dir="ltr">{user.email ?? "—"}</span>} />
          <InfoRow label="نقش" value={user.role} />
          <InfoRow label="KYC" value={KYC_LABELS[user.kycStatus]} />
          <InfoRow
            label="کد معرف"
            value={
              <span dir="ltr" className="font-mono">
                {user.referralCode}
              </span>
            }
          />
          <InfoRow label="تاریخ تولد" value={user.birthDate ?? "—"} />
          <InfoRow
            label="جنسیت"
            value={user.gender === "male" ? "مرد" : user.gender === "female" ? "زن" : "—"}
          />
          <InfoRow label="کد ملی" value={user.nationalId ?? "—"} />
          <InfoRow label="نیب مارکت" value={user.nibMarketLinked ? "متصل" : "متصل نیست"} />
          <InfoRow
            label="تاریخ عضویت"
            value={new Date(user.createdAt).toLocaleDateString("fa-IR")}
          />
          {referrer && (
            <InfoRow label="معرف" value={`${referrer.fullName} (${referrer.inviteCode})`} />
          )}
        </section>

        <section className="border-border bg-surface rounded-2xl border p-5 xl:col-span-1">
          <div className="mb-4 flex items-center gap-2">
            <Wallet size={18} className="text-primary" />
            <h2 className="text-foreground text-sm font-semibold">کیف پول و سپرده</h2>
          </div>
          <InfoRow label="کل توکن" value={`${wallet.totalTokens.toLocaleString("fa-IR")} TWIN`} />
          <InfoRow
            label="قابل استفاده"
            value={`${wallet.availableTokens.toLocaleString("fa-IR")} TWIN`}
          />
          <InfoRow label="مسدود" value={`${wallet.frozenTokens.toLocaleString("fa-IR")} TWIN`} />
          <InfoRow
            label="در انتظار"
            value={`${wallet.pendingTokens.toLocaleString("fa-IR")} TWIN`}
          />
          <div className="border-border mt-4 border-t pt-4">
            <div className="mb-3 flex items-center gap-2">
              <Coins size={16} className="text-amber-500" />
              <h3 className="text-foreground text-xs font-semibold">سپرده زیرمجموعه</h3>
            </div>
            <InfoRow label="امروز" value={`${subsetDeposits.today.toLocaleString("fa-IR")} TWIN`} />
            <InfoRow
              label="این ماه"
              value={`${subsetDeposits.thisMonth.toLocaleString("fa-IR")} TWIN`}
            />
            <InfoRow label="کل" value={`${subsetDeposits.total.toLocaleString("fa-IR")} TWIN`} />
            <InfoRow
              label="در انتظار"
              value={`${subsetDeposits.pendingAmount.toLocaleString("fa-IR")} TWIN`}
            />
          </div>
        </section>

        <section className="border-border bg-surface rounded-2xl border p-5 xl:col-span-1">
          <div className="mb-4 flex items-center gap-2">
            <Target size={18} className="text-primary" />
            <h2 className="text-foreground text-sm font-semibold">مأموریت‌ها و دسترسی</h2>
          </div>
          <InfoRow
            label="مأموریت تکمیل‌شده"
            value={`${missionProgress.completed} / ${missionProgress.total}`}
          />
          <InfoRow label="مأموریت فعال" value={missionProgress.activeCount} />
          <div className="border-border mt-4 border-t pt-4">
            <div className="mb-3 flex items-center gap-2">
              <LayoutGrid size={16} className="text-indigo-500" />
              <h3 className="text-foreground text-xs font-semibold">بخش‌های پنل کلاینت</h3>
            </div>
            <div className="flex flex-col gap-2">
              {modules.map((module) => (
                <div
                  key={module.key}
                  className="border-border flex items-center justify-between rounded-xl border px-3 py-2"
                >
                  <div>
                    <p className="text-foreground text-xs font-medium">{module.label}</p>
                    {module.description && (
                      <p className="text-muted text-[11px]">{module.description}</p>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      module.enabled
                        ? "bg-green-500/10 text-green-600"
                        : "bg-gray-500/10 text-gray-500"
                    }`}
                  >
                    {module.enabled ? "فعال" : "غیرفعال"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="border-border bg-surface rounded-2xl border p-5">
        <div className="mb-4 flex items-center gap-2">
          <Network size={18} className="text-primary" />
          <h2 className="text-foreground text-sm font-semibold">زیرمجموعه‌ها</h2>
        </div>
        {subordinates.length === 0 ? (
          <p className="text-muted py-6 text-center text-sm">زیرمجموعه‌ای ثبت نشده</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-border text-muted border-b text-xs">
                  <th className="py-2 text-start font-medium">نام</th>
                  <th className="py-2 text-start font-medium">سطح</th>
                  <th className="py-2 text-start font-medium">تاریخ عضویت</th>
                  <th className="py-2 text-start font-medium">زیرمجموعه</th>
                </tr>
              </thead>
              <tbody>
                {subordinates.map((subset) => (
                  <tr key={subset.id} className="border-border border-b last:border-0">
                    <td className="text-foreground py-3">{subset.fullName}</td>
                    <td className="text-muted py-3 tabular-nums">{subset.level}</td>
                    <td className="text-muted py-3 text-xs">
                      {new Date(subset.joinDate).toLocaleDateString("fa-IR")}
                    </td>
                    <td className="text-muted py-3 tabular-nums">{subset.subMembersCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {recentSessions.length > 0 && (
        <section className="border-border bg-surface rounded-2xl border p-5">
          <div className="mb-4 flex items-center gap-2">
            <Shield size={18} className="text-primary" />
            <h2 className="text-foreground text-sm font-semibold">آخرین ورودها</h2>
          </div>
          <div className="flex flex-col gap-2">
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className="border-border flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs"
              >
                <span className="text-foreground">{session.device}</span>
                <span className="text-muted" dir="ltr">
                  {session.ip}
                </span>
                <span className="text-muted">{session.createdAt}</span>
                <span className={session.status === "success" ? "text-green-600" : "text-red-600"}>
                  {session.status === "success" ? "موفق" : "ناموفق"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

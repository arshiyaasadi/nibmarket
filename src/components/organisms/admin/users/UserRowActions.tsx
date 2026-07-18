"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Eye, ShieldCheck } from "lucide-react";
import { ROUTES } from "@/config/routes";
import type { AdminUserListItem } from "@/types/admin";

interface Props {
  user: AdminUserListItem;
  onChangeStatus: (user: AdminUserListItem) => void;
}

export function UserRowActions({ user, onChangeStatus }: Props) {
  const t = useTranslations("admin.users");

  return (
    <div className="flex items-center gap-1">
      <Link
        href={ROUTES.ADMIN.USER_DETAIL(user.id)}
        title={t("viewProfile")}
        className="text-muted hover:bg-primary/10 hover:text-primary rounded-lg p-2 transition-colors"
      >
        <Eye size={16} />
      </Link>
      <button
        type="button"
        title={t("changeStatus")}
        onClick={() => onChangeStatus(user)}
        className="text-muted rounded-lg p-2 transition-colors hover:bg-amber-500/10 hover:text-amber-600"
      >
        <ShieldCheck size={16} />
      </button>
    </div>
  );
}

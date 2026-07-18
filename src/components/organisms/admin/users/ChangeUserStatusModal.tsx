"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Modal, ModalBody, ModalFooter } from "@/components/atoms/Modal";
import type {
  AdminUserListItem,
  AdminUserStatus,
  UpdateAdminUserStatusRequest,
} from "@/types/admin";

const STATUS_OPTIONS: AdminUserStatus[] = ["active", "suspended", "pending_verification", "closed"];

interface Props {
  user: AdminUserListItem | null;
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: UpdateAdminUserStatusRequest) => void;
}

function ChangeUserStatusForm({
  user,
  loading,
  onClose,
  onSubmit,
}: {
  user: AdminUserListItem;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: UpdateAdminUserStatusRequest) => void;
}) {
  const t = useTranslations("admin.users");
  const tCommon = useTranslations("common");
  const [status, setStatus] = useState<AdminUserStatus>(user.status);

  return (
    <>
      <ModalBody className="flex flex-col gap-4">
        <div className="border-border bg-background rounded-xl border p-4 text-sm">
          <p className="text-foreground font-semibold">{user.fullName || "—"}</p>
          <p className="text-muted mt-1 text-xs" dir="ltr">
            {user.mobile}
          </p>
          <p className="text-muted mt-1 text-xs">
            {t("currentStatus")}:{" "}
            <span className="text-foreground">{t(`status.${user.status}`)}</span>
          </p>
        </div>

        <div>
          <label className="text-foreground mb-1.5 block text-xs font-medium">
            {t("newStatus")}
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as AdminUserStatus)}
            className="border-border bg-surface text-foreground focus:border-primary w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {t(`status.${option}`)}
              </option>
            ))}
          </select>
        </div>
      </ModalBody>
      <ModalFooter>
        <button
          type="button"
          onClick={onClose}
          className="border-border text-foreground hover:bg-surface-2 rounded-xl border px-4 py-2 text-sm"
        >
          {tCommon("cancel")}
        </button>
        <button
          type="button"
          disabled={loading || status === user.status}
          onClick={() => onSubmit({ status })}
          className="bg-primary rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? t("submitting") : t("submitChanges")}
        </button>
      </ModalFooter>
    </>
  );
}

export function ChangeUserStatusModal({ user, open, loading, onClose, onSubmit }: Props) {
  const t = useTranslations("admin.users");

  if (!user) return null;

  return (
    <Modal open={open} onClose={onClose} title={t("statusModalTitle")} size="md">
      <ChangeUserStatusForm
        key={user.id}
        user={user}
        loading={loading}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}

/**
 * @level organism
 * Create / edit notification audience group.
 */
"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Modal, ModalBody, ModalFooter } from "@/components/atoms/Modal";
import { Button } from "@/components/atoms/Button";
import { UserLazySearch } from "./UserLazySearch";
import { AdminSystemMessagesService } from "@/features/admin-system-messages/service";
import type { AdminUserListItem, NotificationGroupMember } from "@/types/admin";

export type NotificationGroupModalProps = {
  open: boolean;
  groupId: string | null;
  onClose: () => void;
  onSaved?: (groupId: string) => void;
};

export function NotificationGroupModal({
  open,
  groupId,
  onClose,
  onSaved,
}: NotificationGroupModalProps) {
  const t = useTranslations("admin.systemMessages");
  const isEdit = Boolean(groupId);

  const detailQuery = useQuery({
    queryKey: ["admin", "notification-groups", groupId],
    queryFn: () => AdminSystemMessagesService.getGroup(groupId!),
    enabled: open && Boolean(groupId),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? t("editGroup") : t("createGroup")}
      size="lg"
      closeOnBackdrop={false}
    >
      {open ? (
        <GroupModalForm
          key={groupId ?? "create"}
          groupId={groupId}
          initialTitle={detailQuery.data?.title ?? ""}
          initialMembers={detailQuery.data?.members ?? []}
          detailReady={!groupId || Boolean(detailQuery.data)}
          onClose={onClose}
          onSaved={onSaved}
        />
      ) : null}
    </Modal>
  );
}

type GroupModalFormProps = {
  groupId: string | null;
  initialTitle: string;
  initialMembers: NotificationGroupMember[];
  detailReady: boolean;
  onClose: () => void;
  onSaved?: (groupId: string) => void;
};

function GroupModalForm({
  groupId,
  initialTitle,
  initialMembers,
  detailReady,
  onClose,
  onSaved,
}: GroupModalFormProps) {
  const t = useTranslations("admin.systemMessages");
  const tCommon = useTranslations("common");
  const qc = useQueryClient();
  const isEdit = Boolean(groupId);

  const [title, setTitle] = useState(initialTitle);
  const [members, setMembers] = useState(initialMembers);
  const [error, setError] = useState<string | null>(null);
  const [hydratedFrom, setHydratedFrom] = useState(initialTitle);

  // Sync once when edit detail arrives after mount (create has empty initials).
  if (detailReady && isEdit && initialTitle !== hydratedFrom) {
    setHydratedFrom(initialTitle);
    setTitle(initialTitle);
    setMembers(initialMembers);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const memberIds = members.map((m) => m.id);
      if (isEdit && groupId) {
        return AdminSystemMessagesService.updateGroup(groupId, { title, memberIds });
      }
      return AdminSystemMessagesService.createGroup({ title, memberIds });
    },
    onSuccess: (group) => {
      void qc.invalidateQueries({ queryKey: ["admin", "notification-groups"] });
      onSaved?.(group.id);
      onClose();
    },
    onError: () => setError(t("groupSaveError")),
  });

  function addMember(user: AdminUserListItem) {
    if (members.some((m) => m.id === user.id)) return;
    setMembers((prev) => [
      ...prev,
      {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        mobile: user.mobile,
      },
    ]);
  }

  function removeMember(id: string) {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  const canSubmit =
    detailReady && title.trim().length > 0 && members.length > 0 && !saveMutation.isPending;

  return (
    <>
      <ModalBody className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-foreground text-sm font-medium">{t("groupTitle")}</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            className="border-border bg-background h-10 rounded-xl border px-3 text-sm"
            placeholder={t("groupTitlePlaceholder")}
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="text-foreground text-sm font-medium">{t("groupMembers")}</span>
          <UserLazySearch onSelect={addMember} excludeIds={members.map((m) => m.id)} />
        </div>

        {members.length > 0 && (
          <ul className="border-border flex flex-col gap-1 rounded-xl border p-2">
            {members.map((m) => (
              <li
                key={m.id}
                className="bg-background flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm"
              >
                <span>
                  {`${m.firstName} ${m.lastName}`.trim()}
                  <span className="text-muted ms-2 text-xs" dir="ltr">
                    {m.mobile}
                  </span>
                </span>
                <button
                  type="button"
                  aria-label={t("removeMember")}
                  className="text-muted hover:text-danger rounded p-1"
                  onClick={() => removeMember(m.id)}
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}

        {error && <p className="text-danger text-xs">{error}</p>}
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>
          {tCommon("cancel")}
        </Button>
        <Button
          loading={saveMutation.isPending}
          disabled={!canSubmit}
          onClick={() => saveMutation.mutate()}
        >
          {tCommon("save")}
        </Button>
      </ModalFooter>
    </>
  );
}

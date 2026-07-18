"use client";

import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Pencil, Plus, X } from "lucide-react";
import { HorizontalScrollNav } from "@/components/molecules/HorizontalScrollNav";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type {
  AdminInviteTemplateRow,
  CreateAdminInviteTemplateRequest,
  UpdateAdminInviteTemplateRequest,
} from "@/types/admin";

const KNOWN_PLACEHOLDERS = ["{firstName}", "{lastName}", "{inviterName}"];

type ModalMode = { type: "edit"; template: AdminInviteTemplateRow } | { type: "create" };

function previewBody(body: string, maxLength = 90) {
  const flat = body.replace(/\n+/g, " ").trim();
  if (flat.length <= maxLength) return flat;
  return `${flat.slice(0, maxLength)}…`;
}

function InviteTemplateModal({
  mode,
  draft,
  error,
  isSaving,
  onDraftChange,
  onClose,
  onSave,
  onInsertPlaceholder,
}: {
  mode: ModalMode;
  draft: string;
  error: string;
  isSaving: boolean;
  onDraftChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
  onInsertPlaceholder: (token: string) => void;
}) {
  const t = useTranslations("admin.network");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="border-border bg-surface w-full max-w-lg rounded-2xl border shadow-xl">
        <div className="border-border flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-foreground text-sm font-semibold">
            {mode.type === "create" ? t("newTemplate") : t("editTemplate")}
          </h3>
          <button type="button" onClick={onClose} className="text-muted hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-3 p-5">
          <textarea
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            rows={8}
            autoFocus
            className="border-border bg-background text-foreground focus:border-primary w-full resize-y rounded-xl border px-3 py-2 text-sm leading-7 outline-none"
          />
          <div>
            <p className="text-muted mb-1.5 text-[11px]">{t("placeholdersHint")}</p>
            <div className="flex flex-wrap gap-1.5">
              {KNOWN_PLACEHOLDERS.map((token) => (
                <button
                  key={token}
                  type="button"
                  onClick={() => onInsertPlaceholder(token)}
                  className="border-border text-muted hover:text-foreground rounded-md border px-2 py-0.5 font-mono text-[10px]"
                  dir="ltr"
                >
                  {token}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="border-border flex justify-end gap-2 border-t px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-foreground rounded-lg px-3 py-1.5 text-xs"
          >
            {t("cancelEdit")}
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={onSave}
            className="bg-primary rounded-lg px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
          >
            {isSaving ? t("savingTemplate") : t("saveTemplate")}
          </button>
        </div>
      </div>
    </div>
  );
}

export function InviteTemplateList({
  templates,
  isLoading,
}: {
  templates: AdminInviteTemplateRow[];
  isLoading: boolean;
}) {
  const t = useTranslations("admin.network");
  const qc = useQueryClient();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [modal, setModal] = useState<ModalMode | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ["admin", "network", "invite-templates"] });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) =>
      apiClient.patch(ENDPOINTS.ADMIN.NETWORK.UPDATE_INVITE_TEMPLATE(id), {
        body,
      } satisfies UpdateAdminInviteTemplateRequest),
    onSuccess: () => {
      invalidate();
      closeModal();
    },
    onError: () => setError(t("templateSaveError")),
  });

  const createMutation = useMutation({
    mutationFn: (body: string) =>
      apiClient.post(ENDPOINTS.ADMIN.NETWORK.CREATE_INVITE_TEMPLATE, {
        body,
      } satisfies CreateAdminInviteTemplateRequest),
    onSuccess: () => {
      invalidate();
      closeModal();
    },
    onError: () => setError(t("templateSaveError")),
  });

  const isSaving = updateMutation.isPending || createMutation.isPending;

  function closeModal() {
    setModal(null);
    setDraft("");
    setError("");
  }

  function openEdit(template: AdminInviteTemplateRow) {
    setModal({ type: "edit", template });
    setDraft(template.body);
    setError("");
  }

  function openCreate() {
    setModal({ type: "create" });
    setDraft("");
    setError("");
  }

  function insertPlaceholder(token: string) {
    setDraft((prev) => (prev ? `${prev}${token}` : token));
  }

  function handleSave() {
    if (!draft.trim()) {
      setError(t("templateEmptyError"));
      return;
    }
    if (modal?.type === "create") {
      createMutation.mutate(draft.trim());
      return;
    }
    if (modal?.type === "edit") {
      updateMutation.mutate({ id: modal.template.id, body: draft.trim() });
    }
  }

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="border-border bg-surface h-28 min-w-[240px] animate-pulse rounded-xl border"
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <HorizontalScrollNav scrollerRef={scrollerRef} show={templates.length > 1} />

        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory [scrollbar-width:none] gap-3 overflow-x-auto scroll-smooth px-1 pb-1 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {templates.map((template) => (
            <div
              key={template.id}
              className="border-border bg-surface flex min-h-28 w-[240px] shrink-0 snap-start flex-col rounded-xl border p-3"
            >
              <p className="text-foreground line-clamp-3 flex-1 text-xs leading-6">
                {previewBody(template.body)}
              </p>
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => openEdit(template)}
                  className="border-border text-muted hover:border-primary/40 hover:text-primary flex size-7 items-center justify-center rounded-lg border transition-colors"
                  aria-label={t("editTemplate")}
                >
                  <Pencil size={13} />
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={openCreate}
            className="border-border bg-background/40 text-muted hover:border-primary/40 hover:text-primary flex min-h-28 w-[240px] shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-xl border border-dashed transition-colors"
          >
            <Plus size={18} />
            <span className="text-xs font-medium">{t("addTemplate")}</span>
          </button>
        </div>
      </div>

      {modal && (
        <InviteTemplateModal
          mode={modal}
          draft={draft}
          error={error}
          isSaving={isSaving}
          onDraftChange={setDraft}
          onClose={closeModal}
          onSave={handleSave}
          onInsertPlaceholder={insertPlaceholder}
        />
      )}
    </>
  );
}

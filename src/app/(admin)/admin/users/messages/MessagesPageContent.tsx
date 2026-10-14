/**
 * Admin system-message wizard: single / group / all + groups CRUD + history.
 * Talks to mock BFF until backend is ready.
 */
"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Trash2,
  Users,
  User,
  Globe2,
  Plus,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Toggle } from "@/components/atoms/Toggle";
import { Modal, ModalBody, ModalFooter } from "@/components/atoms/Modal";
import { JalaliDateTimePicker } from "@/components/molecules/JalaliDateTimePicker";
import { UserLazySearch } from "@/components/organisms/admin/system-messages/UserLazySearch";
import { NotificationGroupModal } from "@/components/organisms/admin/system-messages/NotificationGroupModal";
import { AdminSystemMessagesService } from "@/features/admin-system-messages/service";
import type {
  AdminUserListItem,
  CampaignAudienceType,
  CampaignStatus,
  NotificationGroup,
  SystemMessageCampaign,
} from "@/types/admin";
import { cn, formatDateTime } from "@/lib/utils";
import { jalaliPartsFromDate, jalaliPartsToIsoUtc } from "@/lib/datetime/jalali";

type Mode = CampaignAudienceType;
type Step = "mode" | "audience" | "message" | "confirm";

const BODY_MAX = 1000;
const TITLE_MAX = 120;

function defaultScheduleIso() {
  const d = new Date(Date.now() + 60 * 60_000);
  d.setSeconds(0, 0);
  const parts = jalaliPartsFromDate(d);
  return jalaliPartsToIsoUtc(parts);
}

export function MessagesPageContent() {
  const t = useTranslations("admin.systemMessages");
  const tCommon = useTranslations("common");
  const qc = useQueryClient();

  const [step, setStep] = useState<Step>("mode");
  const [mode, setMode] = useState<Mode | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<AdminUserListItem[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [channelSystem, setChannelSystem] = useState(true);
  const [channelSms, setChannelSms] = useState(false);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  const [bodyExpanded, setBodyExpanded] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null);
  const [deleteCampaignId, setDeleteCampaignId] = useState<string | null>(null);
  const [historyStatus, setHistoryStatus] = useState<CampaignStatus | "">("");

  const groupsQuery = useQuery({
    queryKey: ["admin", "notification-groups", "list"],
    queryFn: () => AdminSystemMessagesService.listGroups({ page: 0, pageSize: 100 }),
  });

  const historyQuery = useQuery({
    queryKey: ["admin", "system-messages", historyStatus],
    queryFn: () =>
      AdminSystemMessagesService.listCampaigns({
        page: 0,
        pageSize: 30,
        status: historyStatus || undefined,
      }),
  });

  const selectedGroup = useMemo(
    () => groupsQuery.data?.data.find((g) => g.id === selectedGroupId) ?? null,
    [groupsQuery.data, selectedGroupId],
  );

  const sendMutation = useMutation({
    mutationFn: () => {
      if (!mode) throw new Error("mode");
      return AdminSystemMessagesService.createCampaign({
        title: title.trim(),
        body: body.trim(),
        audienceType: mode,
        userId: mode === "user" ? selectedUsers[0]?.id : undefined,
        groupId: mode === "group" ? (selectedGroupId ?? undefined) : undefined,
        channels: { system: channelSystem, sms: channelSms },
        scheduledAt: scheduleEnabled ? scheduledAt : null,
      });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "system-messages"] });
      void qc.invalidateQueries({ queryKey: ["notifications"] });
      resetWizard();
    },
    onError: () => setSubmitError(t("sendError")),
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (id: string) => AdminSystemMessagesService.deleteGroup(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "notification-groups"] });
      if (selectedGroupId === deleteGroupId) setSelectedGroupId(null);
      setDeleteGroupId(null);
    },
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: (id: string) => AdminSystemMessagesService.deleteCampaign(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "system-messages"] });
      void qc.invalidateQueries({ queryKey: ["notifications"] });
      setDeleteCampaignId(null);
    },
  });

  function resetWizard() {
    setStep("mode");
    setMode(null);
    setSelectedUsers([]);
    setSelectedGroupId(null);
    setTitle("");
    setBody("");
    setChannelSystem(true);
    setChannelSms(false);
    setScheduleEnabled(false);
    setScheduledAt(null);
    setBodyExpanded(false);
    setSubmitError(null);
  }

  function pickMode(next: Mode) {
    setMode(next);
    setSelectedUsers([]);
    setSelectedGroupId(null);
    setStep(next === "all" ? "message" : "audience");
  }

  function addSelectedUser(user: AdminUserListItem) {
    setSelectedUsers((prev) => (prev.some((u) => u.id === user.id) ? prev : [...prev, user]));
  }

  function removeSelectedUser(id: string) {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== id));
  }

  function canGoMessage() {
    if (mode === "user") return selectedUsers.length > 0;
    if (mode === "group") return Boolean(selectedGroupId);
    return mode === "all";
  }

  function canGoConfirm() {
    return title.trim().length > 0 && body.trim().length > 0 && body.trim().length <= BODY_MAX;
  }

  function canSubmit() {
    const channelsOk = channelSystem || channelSms;
    const scheduleOk = !scheduleEnabled || Boolean(scheduledAt);
    return channelsOk && scheduleOk && !sendMutation.isPending;
  }

  const audiencePreview =
    mode === "user"
      ? selectedUsers.length === 0
        ? "—"
        : selectedUsers.map((u) => u.fullName || `${u.firstName} ${u.lastName}`.trim()).join("، ")
      : mode === "group"
        ? selectedGroup?.title
        : mode === "all"
          ? t("audienceAll")
          : "—";

  const bodyPreview = bodyExpanded || body.length <= 160 ? body : `${body.slice(0, 160)}…`;

  return (
    <div className="flex flex-col gap-8" dir="rtl">
      <header className="flex flex-col gap-1">
        <h1 className="text-foreground text-xl font-bold">{t("title")}</h1>
        <p className="text-muted text-sm">{t("subtitle")}</p>
      </header>

      {/* Wizard card */}
      <section className="border-border bg-surface/60 rounded-3xl border p-5 shadow-sm backdrop-blur-md sm:p-6">
        <StepIndicator step={step} t={t} />

        {step === "mode" && (
          <div className="mt-org gap-mol grid sm:grid-cols-3">
            <ModeCard
              icon={<User size={22} />}
              title={t("modeSingle")}
              description={t("modeSingleDesc")}
              onClick={() => pickMode("user")}
            />
            <ModeCard
              icon={<Users size={22} />}
              title={t("modeGroup")}
              description={t("modeGroupDesc")}
              onClick={() => pickMode("group")}
            />
            <ModeCard
              icon={<Globe2 size={22} />}
              title={t("modeAll")}
              description={t("modeAllDesc")}
              onClick={() => pickMode("all")}
            />
          </div>
        )}

        {step === "audience" && mode === "user" && (
          <div className="mt-6 flex max-w-lg flex-col gap-4">
            <p className="text-foreground text-sm font-medium">{t("pickUser")}</p>
            <UserLazySearch
              onSelect={addSelectedUser}
              excludeIds={selectedUsers.map((u) => u.id)}
            />
            {selectedUsers.length > 0 && (
              <ul className="border-border gap-atom-md flex flex-col rounded-xl border p-2">
                {selectedUsers.map((user) => (
                  <li
                    key={user.id}
                    className="bg-primary/5 flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm"
                  >
                    <span>
                      {user.fullName || `${user.firstName} ${user.lastName}`.trim()}
                      <span className="text-muted ms-2 text-xs" dir="ltr">
                        {user.mobile}
                      </span>
                    </span>
                    <button
                      type="button"
                      aria-label={t("removeSelectedUser")}
                      className="text-muted hover:text-danger rounded p-1"
                      onClick={() => removeSelectedUser(user.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <WizardNav
              onBack={() => setStep("mode")}
              onNext={() => setStep("message")}
              nextDisabled={!canGoMessage()}
              t={t}
              tCommon={tCommon}
            />
          </div>
        )}

        {step === "audience" && mode === "group" && (
          <div className="mt-6 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-foreground text-sm font-medium">{t("pickGroup")}</p>
              <Button
                size="sm"
                variant="outline"
                startIcon={<Plus size={14} />}
                onClick={() => {
                  setEditingGroupId(null);
                  setGroupModalOpen(true);
                }}
              >
                {t("createGroup")}
              </Button>
            </div>

            <GroupsPanel
              groups={groupsQuery.data?.data ?? []}
              selectedId={selectedGroupId}
              onSelect={setSelectedGroupId}
              onEdit={(id) => {
                setEditingGroupId(id);
                setGroupModalOpen(true);
              }}
              onDelete={setDeleteGroupId}
              t={t}
            />

            <WizardNav
              onBack={() => setStep("mode")}
              onNext={() => setStep("message")}
              nextDisabled={!canGoMessage()}
              t={t}
              tCommon={tCommon}
            />
          </div>
        )}

        {step === "message" && (
          <div className="mt-6 flex max-w-xl flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">{t("messageTitle")}</span>
              <input
                value={title}
                maxLength={TITLE_MAX}
                onChange={(e) => setTitle(e.target.value)}
                className="border-border bg-background h-10 rounded-xl border px-3 text-sm"
                placeholder={t("messageTitlePlaceholder")}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">{t("messageBody")}</span>
              <textarea
                value={body}
                maxLength={BODY_MAX}
                rows={6}
                onChange={(e) => setBody(e.target.value)}
                className="border-border bg-background rounded-xl border px-3 py-2 text-sm"
                placeholder={t("messageBodyPlaceholder")}
              />
              <span className="text-muted text-xs">
                {t("charCount", { count: body.length, max: BODY_MAX })}
              </span>
            </label>
            <WizardNav
              onBack={() => setStep(mode === "all" ? "mode" : "audience")}
              onNext={() => setStep("confirm")}
              nextDisabled={!canGoConfirm()}
              t={t}
              tCommon={tCommon}
            />
          </div>
        )}

        {step === "confirm" && (
          <div className="mt-6 flex max-w-xl flex-col gap-5">
            <div className="border-border rounded-2xl border p-4">
              <p className="text-muted text-xs">{t("previewAudience")}</p>
              <p className="text-foreground mt-1 font-medium">{audiencePreview}</p>
              <p className="text-muted mt-3 text-xs">{t("previewTitle")}</p>
              <p className="text-foreground mt-1 font-semibold">{title}</p>
              <p className="text-muted mt-3 text-xs">{t("previewBody")}</p>
              <p className="text-foreground mt-1 text-sm whitespace-pre-wrap">{bodyPreview}</p>
              {body.length > 160 && (
                <button
                  type="button"
                  className="text-primary mt-2 text-xs font-medium"
                  onClick={() => setBodyExpanded((v) => !v)}
                >
                  {bodyExpanded ? t("collapseBody") : t("expandBody")}
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium">{t("channelsTitle")}</p>
              <Toggle
                checked={channelSystem}
                onChange={(v) => {
                  if (!v && !channelSms) return;
                  setChannelSystem(v);
                }}
                label={t("channelSystem")}
              />
              <Toggle
                checked={channelSms}
                onChange={(v) => {
                  if (!v && !channelSystem) return;
                  setChannelSms(v);
                }}
                label={t("channelSms")}
              />
            </div>

            <section className="border-border bg-background/40 gap-mol p-pad-mol flex flex-col rounded-2xl border">
              <div className="gap-pad-atom-xs flex flex-col">
                <h3 className="text-foreground text-sm font-semibold">
                  {t("scheduleSectionTitle")}
                </h3>
                <p className="text-muted text-xs">{t("scheduleHint")}</p>
              </div>
              <Toggle
                checked={scheduleEnabled}
                onChange={(v) => {
                  setScheduleEnabled(v);
                  if (v && !scheduledAt) setScheduledAt(defaultScheduleIso());
                  if (!v) setScheduledAt(null);
                }}
                label={t("scheduleToggle")}
              />
              {scheduleEnabled && (
                <JalaliDateTimePicker valueIso={scheduledAt} onChange={setScheduledAt} />
              )}
            </section>

            {submitError && <p className="text-danger text-xs">{submitError}</p>}

            <div className="flex flex-wrap gap-2">
              <Button
                variant="ghost"
                onClick={() => setStep("message")}
                startIcon={<ChevronRight size={16} />}
              >
                {tCommon("back")}
              </Button>
              <Button
                loading={sendMutation.isPending}
                disabled={!canSubmit()}
                onClick={() => {
                  setSubmitError(null);
                  sendMutation.mutate();
                }}
                startIcon={<Check size={16} />}
              >
                {scheduleEnabled ? t("scheduleSubmit") : t("sendSubmit")}
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Groups management shortcut when not mid-wizard audience */}
      {step === "mode" && (
        <section className="border-border rounded-3xl border p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-foreground text-base font-semibold">{t("groupsSection")}</h2>
            <Button
              size="sm"
              variant="outline"
              startIcon={<Plus size={14} />}
              onClick={() => {
                setEditingGroupId(null);
                setGroupModalOpen(true);
              }}
            >
              {t("createGroup")}
            </Button>
          </div>
          <GroupsPanel
            groups={groupsQuery.data?.data ?? []}
            selectedId={null}
            onSelect={() => undefined}
            onEdit={(id) => {
              setEditingGroupId(id);
              setGroupModalOpen(true);
            }}
            onDelete={setDeleteGroupId}
            t={t}
            selectable={false}
          />
        </section>
      )}

      {/* History */}
      <section className="border-border rounded-3xl border p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-foreground text-base font-semibold">{t("historyTitle")}</h2>
          <select
            className="border-border bg-background h-9 rounded-lg border px-2 text-sm"
            value={historyStatus}
            onChange={(e) => setHistoryStatus(e.target.value as CampaignStatus | "")}
          >
            <option value="">{t("historyFilterAll")}</option>
            <option value="sent">{t("statusSent")}</option>
            <option value="scheduled">{t("statusScheduled")}</option>
            <option value="deleted">{t("statusDeleted")}</option>
          </select>
        </div>
        <HistoryList items={historyQuery.data?.data ?? []} onDelete={setDeleteCampaignId} t={t} />
      </section>

      <NotificationGroupModal
        open={groupModalOpen}
        groupId={editingGroupId}
        onClose={() => setGroupModalOpen(false)}
        onSaved={(id) => {
          if (mode === "group") setSelectedGroupId(id);
        }}
      />

      <ConfirmDeleteModal
        open={Boolean(deleteGroupId)}
        title={t("deleteGroupTitle")}
        description={t("deleteGroupDesc")}
        onClose={() => setDeleteGroupId(null)}
        loading={deleteGroupMutation.isPending}
        onConfirm={() => deleteGroupId && deleteGroupMutation.mutate(deleteGroupId)}
        tCommon={tCommon}
      />

      <ConfirmDeleteModal
        open={Boolean(deleteCampaignId)}
        title={t("deleteCampaignTitle")}
        description={t("deleteCampaignDesc")}
        onClose={() => setDeleteCampaignId(null)}
        loading={deleteCampaignMutation.isPending}
        onConfirm={() => deleteCampaignId && deleteCampaignMutation.mutate(deleteCampaignId)}
        tCommon={tCommon}
      />
    </div>
  );
}

function StepIndicator({ step, t }: { step: Step; t: ReturnType<typeof useTranslations> }) {
  const steps: Step[] = ["mode", "audience", "message", "confirm"];
  const labels: Record<Step, string> = {
    mode: t("stepMode"),
    audience: t("stepAudience"),
    message: t("stepMessage"),
    confirm: t("stepConfirm"),
  };
  const idx = steps.indexOf(step);

  return (
    <ol className="flex w-full items-start" aria-label={t("title")}>
      {steps.map((s, i) => {
        const done = i < idx;
        const current = i === idx;
        return (
          <li
            key={s}
            className={cn(
              "gap-atom-md relative flex flex-1 flex-col items-center",
              i < steps.length - 1 && "pe-mol",
            )}
          >
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  "absolute start-1/2 top-[1.125rem] h-0.5 w-full",
                  done || current ? "bg-primary/50" : "bg-border",
                )}
              />
            )}
            <span
              className={cn(
                "relative z-[1] flex size-9 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                done && "bg-primary text-white",
                current && "bg-primary ring-primary/20 text-white ring-4",
                !done && !current && "border-border bg-background text-muted border",
              )}
              aria-current={current ? "step" : undefined}
            >
              {done ? <Check size={16} strokeWidth={2.5} /> : i + 1}
            </span>
            <span
              className={cn(
                "text-center text-xs font-medium",
                current ? "text-foreground" : done ? "text-primary" : "text-muted",
              )}
            >
              {labels[s]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function ModeCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-border hover:border-primary/40 hover:bg-primary/5 flex flex-col items-start gap-2 rounded-2xl border p-4 text-start transition-colors"
    >
      <span className="text-primary">{icon}</span>
      <span className="text-foreground font-semibold">{title}</span>
      <span className="text-muted text-xs leading-relaxed">{description}</span>
    </button>
  );
}

function WizardNav({
  onBack,
  onNext,
  nextDisabled,
  t,
  tCommon,
}: {
  onBack: () => void;
  onNext: () => void;
  nextDisabled: boolean;
  t: ReturnType<typeof useTranslations>;
  tCommon: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="flex flex-wrap gap-2 pt-2">
      <Button variant="ghost" onClick={onBack} startIcon={<ChevronRight size={16} />}>
        {tCommon("back")}
      </Button>
      <Button disabled={nextDisabled} onClick={onNext} endIcon={<ChevronLeft size={16} />}>
        {t("continue")}
      </Button>
    </div>
  );
}

function GroupsPanel({
  groups,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
  t,
  selectable = true,
}: {
  groups: NotificationGroup[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  t: ReturnType<typeof useTranslations>;
  selectable?: boolean;
}) {
  if (groups.length === 0) {
    return <p className="text-muted text-sm">{t("groupsEmpty")}</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {groups.map((g) => {
        const selected = selectable && selectedId === g.id;
        return (
          <li
            key={g.id}
            className={cn(
              "border-border flex items-center gap-2 rounded-xl border px-3 py-2",
              selected && "border-primary bg-primary/5",
            )}
          >
            {selectable ? (
              <button
                type="button"
                className="flex min-w-0 flex-1 flex-col items-start text-start"
                onClick={() => onSelect(g.id)}
              >
                <span className="text-foreground truncate text-sm font-medium">{g.title}</span>
                <span className="text-muted text-xs">
                  {t("memberCount", { count: g.memberCount })}
                </span>
              </button>
            ) : (
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-foreground truncate text-sm font-medium">{g.title}</span>
                <span className="text-muted text-xs">
                  {t("memberCount", { count: g.memberCount })}
                </span>
              </div>
            )}
            <button
              type="button"
              className="text-muted hover:text-foreground rounded p-1.5"
              aria-label={t("editGroup")}
              onClick={() => onEdit(g.id)}
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              className="text-muted hover:text-danger rounded p-1.5"
              aria-label={t("deleteGroup")}
              onClick={() => onDelete(g.id)}
            >
              <Trash2 size={14} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function HistoryList({
  items,
  onDelete,
  t,
}: {
  items: SystemMessageCampaign[];
  onDelete: (id: string) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  if (items.length === 0) {
    return <p className="text-muted text-sm">{t("historyEmpty")}</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li
          key={item.id}
          className="border-border flex flex-col gap-2 rounded-xl border px-3 py-3 sm:flex-row sm:items-start sm:justify-between"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <MessageSquare size={14} className="text-primary shrink-0" />
              <span className="text-foreground text-sm font-semibold">{item.title}</span>
              <StatusBadge status={item.status} t={t} />
            </div>
            <p className="text-muted mt-1 line-clamp-2 text-xs">{item.body}</p>
            <p className="text-muted mt-2 text-xs">
              {item.audienceLabel} · {item.channels.system ? t("channelSystem") : null}
              {item.channels.system && item.channels.sms ? " + " : null}
              {item.channels.sms ? t("channelSms") : null}
              {" · "}
              {formatDateTime(item.sentAt ?? item.scheduledAt ?? item.createdAt)}
            </p>
          </div>
          {item.status !== "deleted" && (
            <Button
              size="sm"
              variant="ghost"
              className="text-danger shrink-0"
              startIcon={<Trash2 size={14} />}
              onClick={() => onDelete(item.id)}
            >
              {t("deleteCampaign")}
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}

function StatusBadge({
  status,
  t,
}: {
  status: CampaignStatus;
  t: ReturnType<typeof useTranslations>;
}) {
  const map: Record<CampaignStatus, string> = {
    sent: t("statusSent"),
    scheduled: t("statusScheduled"),
    deleted: t("statusDeleted"),
  };
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold",
        status === "sent" && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
        status === "scheduled" && "bg-amber-500/15 text-amber-700 dark:text-amber-300",
        status === "deleted" && "bg-muted/40 text-muted",
      )}
    >
      {map[status]}
    </span>
  );
}

function ConfirmDeleteModal({
  open,
  title,
  description,
  onClose,
  onConfirm,
  loading,
  tCommon,
}: {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  tCommon: ReturnType<typeof useTranslations>;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <ModalBody>
        <p className="text-muted text-sm">{description}</p>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>
          {tCommon("cancel")}
        </Button>
        <Button variant="danger" loading={loading} onClick={onConfirm}>
          {tCommon("confirm")}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

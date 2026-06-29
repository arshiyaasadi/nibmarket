"use client";

import { useState } from "react";
import { Maximize2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useNetworkReferrer, useNetworkTree } from "@/features/network/queries";
import { SubmitReferrerModal } from "@/components/organisms/network/SubmitReferrerModal";
import { Modal, ModalBody } from "@/components/atoms/Modal";
import { cn } from "@/lib/utils";

const NetworkOrgChart = dynamic(
  () => import("@/components/organisms/network/NetworkOrgChart"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[220px] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    ),
  },
);

type NetworkTreeWidgetProps = {
  title?: string;
  showTitle?: boolean;
  showEmptyInvite?: boolean;
  stretch?: boolean;
  minHeight?: number;
  onInvite?: () => void;
};

export function NetworkTreeWidget({
  title,
  showTitle = true,
  showEmptyInvite = true,
  stretch = false,
  minHeight = 240,
  onInvite,
}: NetworkTreeWidgetProps) {
  const t = useTranslations("network");
  const resolvedTitle = title ?? t("treeWidgetTitle");
  const compact = !showTitle;
  const { data: root, isLoading, isError } = useNetworkTree();
  const { data: referrer, isLoading: referrerLoading } = useNetworkReferrer();
  const [modalOpen, setModalOpen] = useState(false);
  const [showReferrerModal, setShowReferrerModal] = useState(false);

  const hasTree = Boolean(!isLoading && !isError && root && (root.children?.length ?? 0) > 0);
  const hasNoSubsets = Boolean(root && !(root.children?.length ?? 0));
  const canRegisterReferrer = hasNoSubsets && !referrerLoading && !referrer;

  return (
    <>
      <div
        className={cn(
          "flex flex-col gap-3",
          (stretch || compact) && "min-h-0 flex-1",
        )}
      >
        {showTitle && (
          <h2 className="shrink-0 text-base font-bold text-foreground">{resolvedTitle}</h2>
        )}

        <div
          className={cn(
            "relative flex flex-col rounded-2xl border border-border bg-surface p-4 sm:p-5",
            (stretch || compact) && "min-h-0 flex-1",
            stretch && "justify-center",
          )}
        >
          {hasTree && (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="absolute start-3 top-3 z-10 flex size-8 items-center justify-center rounded-lg border border-border bg-surface/90 text-primary shadow-sm backdrop-blur-sm transition hover:bg-surface-2"
              aria-label={t("treeExpand")}
            >
              <Maximize2 size={16} />
            </button>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : isError || !root ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted">
              {t("treeError")}
            </div>
          ) : (
            <NetworkOrgChart
              root={root}
              minHeight={hasTree ? minHeight : undefined}
              interactive={hasTree}
              showZoomControls={hasTree}
              compactEmpty={compact}
              tightEmpty={stretch && showTitle}
              showEmptyInvite={showEmptyInvite}
              embedded
              onInvite={onInvite}
              onRegisterReferrer={() => setShowReferrerModal(true)}
              canRegisterReferrer={canRegisterReferrer}
            />
          )}
        </div>
      </div>

      {modalOpen && root && (
        <Modal
          open
          onClose={() => setModalOpen(false)}
          title={resolvedTitle}
          size="full"
          className="max-w-[min(960px,calc(100vw-2rem))]"
        >
          <ModalBody className="py-4">
            <NetworkOrgChart
              key="network-tree-modal"
              root={root}
              minHeight={520}
              interactive
              showZoomControls
              embedded
              onInvite={onInvite}
              onRegisterReferrer={() => {
                setModalOpen(false);
                setShowReferrerModal(true);
              }}
              canRegisterReferrer={canRegisterReferrer}
            />
          </ModalBody>
        </Modal>
      )}

      {showReferrerModal && (
        <SubmitReferrerModal onClose={() => setShowReferrerModal(false)} />
      )}
    </>
  );
}

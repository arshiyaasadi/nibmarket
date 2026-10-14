"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/atoms/Button";
import { Modal, ModalBody, ModalFooter } from "@/components/atoms/Modal";
import { getPanelProfileUrl } from "@/config/sso";

type InviteKycGateModalProps = {
  open: boolean;
  onClose: () => void;
};

export function InviteKycGateModal({ open, onClose }: InviteKycGateModalProps) {
  const t = useTranslations("network");
  const profileUrl = getPanelProfileUrl();

  function handleCompleteKyc() {
    if (profileUrl) {
      window.location.assign(profileUrl);
      return;
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={t("inviteKycGateTitle")} size="sm">
      <ModalBody>
        <p className="text-muted text-sm leading-7">{t("inviteKycGateDesc")}</p>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>
          {t("inviteKycGateContinue")}
        </Button>
        <Button variant="primary" onClick={handleCompleteKyc}>
          {t("inviteKycGateComplete")}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

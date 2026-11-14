"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Modal, ModalBody } from "@/components/atoms/Modal";
import { Spinner } from "@/components/atoms/Spinner";
import { SejamKycForm } from "@/components/organisms/auth/SejamKycForm";
import { useAuthProfile } from "@/features/auth/queries";
import { needsSejamKyc, SEJAM_KYC_MODAL_ID } from "@/features/auth/sejam-kyc";
import { useUiSlice } from "@/store/slices/ui.slice";

/**
 * Panel Sejam KYC modal shell (banner lives under navbar via SejamKycNoticeBanner).
 * Auto-opens once when profile lacks hasSejamIdentity; notification / profile CTA
 * reopen via `openModal(SEJAM_KYC_MODAL_ID)`.
 */
export function SejamKycGate() {
  const t = useTranslations("auth");
  const profileQuery = useAuthProfile();
  const activeModal = useUiSlice((s) => s.activeModal);
  const openModal = useUiSlice((s) => s.openModal);
  const closeModal = useUiSlice((s) => s.closeModal);
  const autoOpenedRef = useRef(false);

  const unverified = profileQuery.isSuccess && needsSejamKyc(profileQuery.data?.hasSejamIdentity);
  const modalOpen = activeModal === SEJAM_KYC_MODAL_ID;

  useEffect(() => {
    if (!unverified) {
      autoOpenedRef.current = false;
      if (activeModal === SEJAM_KYC_MODAL_ID) closeModal();
      return;
    }
    if (!autoOpenedRef.current) {
      autoOpenedRef.current = true;
      openModal(SEJAM_KYC_MODAL_ID);
    }
  }, [unverified, activeModal, openModal, closeModal]);

  if (profileQuery.isLoading) {
    return (
      <div
        className="bg-background/80 fixed inset-0 z-[80] flex items-center justify-center backdrop-blur-sm"
        role="status"
        aria-live="polite"
      >
        <Spinner size="lg" />
      </div>
    );
  }

  if (profileQuery.isError) {
    return (
      <div className="bg-background/95 fixed inset-0 z-[80] flex items-center justify-center p-6 backdrop-blur-sm">
        <div className="border-border bg-surface w-full max-w-md rounded-xl border p-6 shadow-sm">
          <Alert variant="danger" title={t("kycGateTitle")}>
            {t("kycProfileLoadFailed")}
          </Alert>
          <Button
            className="mt-4"
            fullWidth
            variant="primary"
            onClick={() => void profileQuery.refetch()}
          >
            {t("kycRetryProfile")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Modal
      open={modalOpen && unverified}
      onClose={closeModal}
      title={t("kycGateTitle")}
      size="md"
      closeOnBackdrop={false}
    >
      <ModalBody>
        <SejamKycForm onSuccess={closeModal} />
      </ModalBody>
    </Modal>
  );
}

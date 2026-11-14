"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Modal, ModalBody } from "@/components/atoms/Modal";
import { SejamKycForm } from "@/components/organisms/auth/SejamKycForm";
import { useAuthProfile } from "@/features/auth/queries";
import { needsSejamKyc, SEJAM_KYC_MODAL_ID } from "@/features/auth/sejam-kyc";
import { useUiSlice } from "@/store/slices/ui.slice";
import { cn } from "@/lib/utils";

/**
 * Soft KYC modal — opens only via notification / profile / banner CTA
 * (`openModal(SEJAM_KYC_MODAL_ID)`). Does **not** auto-open after login.
 */
export function SejamKycGate() {
  const t = useTranslations("auth");
  const profileQuery = useAuthProfile();
  const activeModal = useUiSlice((s) => s.activeModal);
  const closeModal = useUiSlice((s) => s.closeModal);

  const unverified = profileQuery.isSuccess && needsSejamKyc(profileQuery.data?.hasSejamIdentity);
  const modalOpen = activeModal === SEJAM_KYC_MODAL_ID;

  useEffect(() => {
    if (!unverified && activeModal === SEJAM_KYC_MODAL_ID) {
      closeModal();
    }
  }, [unverified, activeModal, closeModal]);

  return (
    <Modal
      open={modalOpen && unverified}
      onClose={closeModal}
      title={t("kycGateTitle")}
      size="md"
      closeOnBackdrop={false}
      className={cn(
        "text-foreground border border-white/12 bg-[#14141c]/95 shadow-2xl shadow-black/40",
        "backdrop-blur-2xl backdrop-saturate-150",
      )}
    >
      <ModalBody className="pb-pad-mol-md">
        <SejamKycForm onSuccess={closeModal} />
      </ModalBody>
    </Modal>
  );
}

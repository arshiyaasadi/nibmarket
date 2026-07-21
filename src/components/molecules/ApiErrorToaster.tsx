"use client";

import { useCallback, useEffect, useState } from "react";
import { ToastContainer, type ToastItem } from "@/components/atoms/Toast";

type ToastPublisher = (message: string) => void;

const listeners = new Set<ToastPublisher>();

export function showApiErrorToast(message: string): void {
  for (const listener of listeners) {
    listener(message);
  }
}

export function ApiErrorToaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const publish: ToastPublisher = (message) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, variant: "danger", message }]);
    };

    listeners.add(publish);
    return () => {
      listeners.delete(publish);
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  return <ToastContainer toasts={toasts} onDismiss={dismiss} />;
}

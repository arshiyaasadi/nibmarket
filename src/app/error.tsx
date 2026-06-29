"use client";

import { useEffect } from "react";
import { logger } from "@/lib/errors/logger";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Route error", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center" dir="rtl">
      <h2 className="text-xl font-bold text-red-600">خطایی رخ داد</h2>
      <p className="text-sm text-gray-600">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:opacity-90"
      >
        تلاش مجدد
      </button>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { logger } from "@/lib/errors/logger";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Global crash", error);
  }, [error]);

  return (
    <html lang="fa" dir="rtl">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
          <h2 className="text-xl font-bold text-red-600">خطای بحرانی</h2>
          <p className="text-sm text-gray-600">
            لطفاً صفحه را رفرش کنید یا با پشتیبانی تماس بگیرید.
          </p>
          <button
            onClick={reset}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:opacity-90"
          >
            تلاش مجدد
          </button>
        </div>
      </body>
    </html>
  );
}

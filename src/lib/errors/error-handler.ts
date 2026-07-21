import { ApiException } from "@/types/api";
import { extractApiErrorMessage } from "@/lib/api/error-message";
import { logger } from "./logger";
import type { AppError } from "./api-error";

export function handleApiError(error: unknown): AppError {
  if (error instanceof ApiException) {
    if (error.statusCode === 401) {
      void import("@/lib/auth/session").then(({ clearSessionLocally }) => {
        clearSessionLocally();
      });
      return {
        code: "UNAUTHORIZED",
        message: error.message || "errors.sessionExpired",
        status: 401,
      };
    }

    if (error.statusCode === 404) {
      return {
        code: "NOT_FOUND",
        message: error.message || "errors.notFound",
        status: 404,
      };
    }

    if (error.statusCode >= 500) {
      logger.error("Server error", error);
    }

    return {
      code: "API_ERROR",
      message: error.message,
      status: error.statusCode,
    };
  }

  if (error instanceof TypeError && error.message.includes("fetch")) {
    return { code: "NETWORK_ERROR", message: "errors.networkError" };
  }

  logger.error("Unknown error", error);
  return { code: "UNKNOWN", message: "errors.unknownError" };
}

/** User-visible message — prefers backend text; skips i18n keys when possible. */
export function resolveUserErrorMessage(error: unknown, fallback = "خطایی رخ داد"): string {
  if (error instanceof ApiException) {
    return error.message || fallback;
  }

  const appError = handleApiError(error);
  if (appError.message.startsWith("errors.")) {
    return fallback;
  }

  return appError.message || fallback;
}

export { extractApiErrorMessage };

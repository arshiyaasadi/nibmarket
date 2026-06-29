const isDev = process.env.NODE_ENV === "development";

export const logger = {
  error: (message: string, error?: unknown) => {
    if (isDev) {
      console.error(`[Nib Error] ${message}`, error);
    }
    // در production: Sentry یا سرویس logging مشابه
  },

  warn: (message: string, data?: unknown) => {
    if (isDev) {
      console.warn(`[Nib Warn] ${message}`, data);
    }
  },

  info: (message: string, data?: unknown) => {
    if (isDev) {
      console.info(`[Nib Info] ${message}`, data);
    }
  },
};

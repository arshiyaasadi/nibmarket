import axios from 'axios'

/** User-facing Persian message from axios/network errors (check_token, dashboard API, …). */
export function formatApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
      return 'اتصال به سرور API برقرار نشد (شبکه، CORS یا SSL). در Network دنبال درخواست به api-club.nibdev.com بگردید.'
    }

    if (err.response) {
      return `سرور API پاسخ داد (${err.response.status}). توکن نامعتبر یا منقضی است.`
    }

    if (err.message) {
      return err.message
    }
  }

  if (err instanceof Error && err.message) {
    return err.message
  }

  return 'تبادل توکن با سرور انجام نشد.'
}

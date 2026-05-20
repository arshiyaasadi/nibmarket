'use client'

import { useCallback, useState } from 'react'

import { mapSendInviteResponse, postNetworkInviteRaw } from 'src/api/network/invite'
import { postNetworkReferrerRaw } from 'src/api/network/referrer'
import { isApiMode } from 'src/configs/data-source'
import { mapSubmitReferrerResponse } from 'src/lib/network/mappers'
import { mockSubmitReferrerResult } from 'src/mocks/network'
import type {
  NetworkReferrerInfo,
  SendNetworkInviteRequest,
  SendNetworkInviteResponse,
  SubmitReferrerRequest
} from 'src/types/api/network'

function getMutationError(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const axiosErr = err as { response?: { status?: number } }
    if (axiosErr.response?.status) {
      return `خطا در انجام عملیات (${axiosErr.response.status})`
    }
  }
  if (err instanceof Error) {
    if (err.message === 'Network Error') {
      return 'خطا در اتصال به سرور. اتصال اینترنت را بررسی کنید.'
    }

    return err.message
  }

  return 'خطا در انجام عملیات'
}

export function useSubmitReferrerCode() {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = useCallback(async (body: SubmitReferrerRequest): Promise<NetworkReferrerInfo | null> => {
    setSubmitting(true)
    setError(null)

    try {
      if (!isApiMode()) {
        await new Promise(r => setTimeout(r, 400))

        return { ...mockSubmitReferrerResult }
      }

      const raw = await postNetworkReferrerRaw(body)

      return mapSubmitReferrerResponse(raw)
    } catch (err) {
      setError(getMutationError(err))

      return null
    } finally {
      setSubmitting(false)
    }
  }, [])

  return { submit, submitting, error, clearError: () => setError(null) }
}

export function useSendNetworkInvite() {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const send = useCallback(
    async (body: SendNetworkInviteRequest): Promise<SendNetworkInviteResponse | null> => {
      setSubmitting(true)
      setError(null)

      try {
        if (!isApiMode()) {
          await new Promise(r => setTimeout(r, 500))

          return { success: true, remainingInvites: Math.max(0, 14) }
        }

        const raw = await postNetworkInviteRaw(body)

        return mapSendInviteResponse(raw)
      } catch (err) {
        setError(getMutationError(err))

        return null
      } finally {
        setSubmitting(false)
      }
    },
    []
  )

  return { send, submitting, error, clearError: () => setError(null) }
}

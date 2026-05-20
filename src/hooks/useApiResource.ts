'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import type { ApiEndpointSlug } from 'src/configs/data-source'
import { shouldUseApiForEndpoint } from 'src/configs/data-source'

export type FetchStatus = 'idle' | 'loading' | 'success' | 'error'

export type UseApiResourceResult<T> = {
  data: T
  loading: boolean
  retrying: boolean
  error: string | null
  status: FetchStatus
  hasData: boolean
  usedFallback: boolean
  refetch: () => void
}

type UseApiResourceOptions<T> = {
  slug: ApiEndpointSlug
  mockData: T
  fetcher: () => Promise<unknown>
  mapResponse: (raw: unknown) => T
  deps?: unknown[]
}

function isNetworkError(err: unknown): boolean {
  if (err && typeof err === 'object') {
    const e = err as { message?: string; code?: string }
    if (e.code === 'ERR_NETWORK') return true
    if (e.message === 'Network Error' || e.message?.includes('Network Error')) return true
  }

  return false
}

function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const axiosErr = err as { response?: { status?: number }; message?: string; code?: string }
    if (axiosErr.response?.status) {
      return `خطا در دریافت داده (${axiosErr.response.status})`
    }
    if (isNetworkError(err)) {
      return 'خطا در اتصال به سرور. اتصال اینترنت را بررسی کنید.'
    }
  }
  if (err instanceof Error) {
    if (err.message.includes('Unsupported') && err.message.includes('color')) {
      return 'خطا در نمایش داده — لطفاً دوباره تلاش کنید'
    }
    if (isNetworkError(err)) {
      return 'خطا در اتصال به سرور. اتصال اینترنت را بررسی کنید.'
    }

    return err.message
  }

  return 'خطا در دریافت داده'
}

type LoadSource = 'mount' | 'retry'

export function useApiResource<T>({
  slug,
  mockData,
  fetcher,
  mapResponse,
  deps = []
}: UseApiResourceOptions<T>): UseApiResourceResult<T> {
  const [data, setData] = useState<T>(mockData)
  const [loading, setLoading] = useState(shouldUseApiForEndpoint(slug))
  const [retrying, setRetrying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<FetchStatus>(
    shouldUseApiForEndpoint(slug) ? 'loading' : 'success'
  )
  const [usedFallback, setUsedFallback] = useState(false)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(!shouldUseApiForEndpoint(slug))

  const mountedRef = useRef(true)
  const requestIdRef = useRef(0)
  const isFetchingRef = useRef(false)

  const fetcherRef = useRef(fetcher)
  const mapResponseRef = useRef(mapResponse)
  const mockDataRef = useRef(mockData)

  fetcherRef.current = fetcher
  mapResponseRef.current = mapResponse
  mockDataRef.current = mockData

  const depsKey = JSON.stringify(deps)

  const load = useCallback(
    async (source: LoadSource = 'mount') => {
      if (!shouldUseApiForEndpoint(slug)) {
        setData(mockDataRef.current)
        setLoading(false)
        setRetrying(false)
        setError(null)
        setStatus('success')
        setUsedFallback(false)
        setHasLoadedOnce(true)

        return
      }

      if (isFetchingRef.current) return

      const requestId = ++requestIdRef.current
      isFetchingRef.current = true

      if (source === 'retry') {
        setRetrying(true)
      } else {
        setLoading(true)
      }
      setError(null)
      setStatus('loading')

      try {
        const raw = await fetcherRef.current()
        if (!mountedRef.current || requestId !== requestIdRef.current) return

        let mapped: T
        try {
          mapped = mapResponseRef.current(raw)
        } catch (mapErr) {
          if (!mountedRef.current || requestId !== requestIdRef.current) return
          setError(getErrorMessage(mapErr) || 'داده دریافتی نامعتبر است')
          setStatus('error')
          setUsedFallback(false)

          return
        }

        setData(mapped)
        setError(null)
        setStatus('success')
        setUsedFallback(false)
      } catch (err) {
        if (!mountedRef.current || requestId !== requestIdRef.current) return

        setStatus('error')
        setUsedFallback(false)
        setError(getErrorMessage(err))
      } finally {
        if (mountedRef.current && requestId === requestIdRef.current) {
          isFetchingRef.current = false
          setLoading(false)
          setRetrying(false)
          setHasLoadedOnce(true)
        }
      }
    },
    [slug]
  )

  useEffect(() => {
    mountedRef.current = true
    load('mount')

    return () => {
      mountedRef.current = false
      requestIdRef.current += 1
      isFetchingRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, depsKey])

  const refetch = useCallback(() => {
    if (isFetchingRef.current) return
    load('retry')
  }, [load])

  const hasData = status === 'success'
  const initialLoading = loading && !hasLoadedOnce

  return {
    data,
    loading: initialLoading,
    retrying,
    error,
    status,
    hasData,
    usedFallback,
    refetch
  }
}

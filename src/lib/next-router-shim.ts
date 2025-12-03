// Router compatibility shim for App Router
// This module mimics next/router API using next/navigation

'use client'

import React from 'react'
import { usePathname, useRouter as useAppRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'

// Router events mock
const routerEvents = {
  on: () => {},
  off: () => {},
  emit: () => {}
}

// Router type compatible with next/router
export interface NextRouterShim {
  route: string
  pathname: string
  query: Record<string, string>
  asPath: string
  isReady: boolean
  push: (url: string | { pathname: string; query?: Record<string, string> }) => void
  replace: (url: string | { pathname: string; query?: Record<string, string> }) => void
  reload: () => void
  back: () => void
  prefetch: (url: string) => Promise<void>
  beforePopState: (cb: () => boolean) => void
  events: {
    on: (event: string, handler: () => void) => void
    off: (event: string, handler: () => void) => void
    emit: (event: string) => void
  }
}

// Hook that provides router compatibility
export function useRouter(): NextRouterShim {
  const pathname = usePathname()
  const appRouter = useAppRouter()
  const searchParams = useSearchParams()

  const query = useMemo(() => {
    const params: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      params[key] = value
    })
    return params
  }, [searchParams])

  const asPath = useMemo(() => {
    const queryString = searchParams.toString()
    return pathname + (queryString ? `?${queryString}` : '')
  }, [pathname, searchParams])

  const push = useCallback((url: string | { pathname: string; query?: Record<string, string> }) => {
    if (typeof url === 'string') {
      appRouter.push(url)
    } else {
      const queryString = url.query 
        ? '?' + new URLSearchParams(url.query).toString()
        : ''
      appRouter.push(url.pathname + queryString)
    }
  }, [appRouter])

  const replace = useCallback((url: string | { pathname: string; query?: Record<string, string> }) => {
    if (typeof url === 'string') {
      appRouter.replace(url)
    } else {
      const queryString = url.query 
        ? '?' + new URLSearchParams(url.query).toString()
        : ''
      appRouter.replace(url.pathname + queryString)
    }
  }, [appRouter])

  return useMemo(() => ({
    route: pathname,
    pathname: pathname,
    query: query,
    asPath: asPath,
    isReady: true,
    push,
    replace,
    reload: () => {
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    },
    back: () => appRouter.back(),
    prefetch: async () => {
      // App Router handles prefetching automatically
      return Promise.resolve()
    },
    beforePopState: () => {
      // No-op in App Router
    },
    events: routerEvents
  }), [pathname, query, asPath, push, replace, appRouter])
}

// Router class mock
export class Router {
  static events = routerEvents
  
  route = typeof window !== 'undefined' ? window.location.pathname : ''
  pathname = typeof window !== 'undefined' ? window.location.pathname : ''
  query: Record<string, string> = {}
  asPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : ''
  
  push(url: string) {
    if (typeof window !== 'undefined') {
      window.location.href = url
    }
  }
  
  replace(url: string) {
    if (typeof window !== 'undefined') {
      window.location.replace(url)
    }
  }
  
  reload() {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }
  
  back() {
    if (typeof window !== 'undefined') {
      window.history.back()
    }
  }
  
  prefetch() {
    return Promise.resolve()
  }
  
  beforePopState() {}
}

// withRouter HOC mock
export function withRouter<P extends object>(
  Component: React.ComponentType<P & { router: NextRouterShim }>
) {
  return function WithRouterComponent(props: P) {
    const router = useRouter()
    return React.createElement(Component, { ...props, router })
  }
}

// Default export
export default {
  useRouter,
  Router,
  withRouter
}


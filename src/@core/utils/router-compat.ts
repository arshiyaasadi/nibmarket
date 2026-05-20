// Router compatibility shim for App Router
// This provides a mock next/router that works with App Router

'use client'

import { usePathname, useRouter as useAppRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

// Mock router object that mimics next/router interface
export const createRouterShim = () => {
  if (typeof window === 'undefined') {
    return null
  }

  const pathname = window.location.pathname
  const searchParams = new URLSearchParams(window.location.search)
  const query: Record<string, string> = {}
  
  searchParams.forEach((value, key) => {
    query[key] = value
  })

  return {
    route: pathname,
    pathname: pathname,
    query: query,
    asPath: pathname + (window.location.search || ''),
    isReady: true,
    push: (url: string | { pathname: string; query?: Record<string, string> }) => {
      if (typeof url === 'string') {
        window.location.href = url
      } else {
        const queryString = url.query 
          ? '?' + new URLSearchParams(url.query).toString()
          : ''
        window.location.href = url.pathname + queryString
      }
    },
    replace: (url: string | { pathname: string; query?: Record<string, string> }) => {
      if (typeof url === 'string') {
        window.location.replace(url)
      } else {
        const queryString = url.query 
          ? '?' + new URLSearchParams(url.query).toString()
          : ''
        window.location.replace(url.pathname + queryString)
      }
    },
    reload: () => window.location.reload(),
    back: () => window.history.back(),
    prefetch: () => Promise.resolve(),
    beforePopState: () => {
      // Empty function for compatibility
    },
    events: {
      on: () => {
        // Empty function for compatibility
      },
      off: () => {
        // Empty function for compatibility
      },
      emit: () => {
        // Empty function for compatibility
      }
    }
  }
}

// Hook that provides router compatibility using App Router hooks
export const useRouterShim = () => {
  const pathname = usePathname()
  const appRouter = useAppRouter()
  const searchParams = useSearchParams()

  const query: Record<string, string> = {}
  searchParams.forEach((value, key) => {
    query[key] = value
  })

  return {
    route: pathname,
    pathname: pathname,
    query: query,
    asPath: pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ''),
    isReady: true,
    push: useCallback((url: string | { pathname: string; query?: Record<string, string> }) => {
      if (typeof url === 'string') {
        appRouter.push(url)
      } else {
        const queryString = url.query 
          ? '?' + new URLSearchParams(url.query).toString()
          : ''
        appRouter.push(url.pathname + queryString)
      }
    }, [appRouter]),
    replace: useCallback((url: string | { pathname: string; query?: Record<string, string> }) => {
      if (typeof url === 'string') {
        appRouter.replace(url)
      } else {
        const queryString = url.query 
          ? '?' + new URLSearchParams(url.query).toString()
          : ''
        appRouter.replace(url.pathname + queryString)
      }
    }, [appRouter]),
    reload: () => window.location.reload(),
    back: () => appRouter.back(),
    prefetch: () => Promise.resolve(),
    beforePopState: () => {
      // Empty function for compatibility
    },
    events: {
      on: () => {
        // Empty function for compatibility
      },
      off: () => {
        // Empty function for compatibility
      },
      emit: () => {
        // Empty function for compatibility
      }
    }
  }
}

// Setup router shim globally for next/router module
// This intercepts next/router imports and provides a compatible router
export const setupRouterShim = () => {
  if (typeof window === 'undefined') return
  
  // Check if already set up
  if ((window as any).__nextRouterShimSetup) return
  
  try {
    // Create a mock router instance
    const mockRouter = createRouterShim()
    
    // Store reference for later use
    ;(window as any).__nextRouterShim = mockRouter
    
    // Override the next/router module if possible
    // This is a workaround since we can't directly override module imports
    // Components will need to use the shim via window.__nextRouterShim
    
    ;(window as any).__nextRouterShimSetup = true
  } catch (error) {
    console.warn('Failed to setup router shim:', error)
  }
}

// Get the router shim instance
export const getRouterShim = () => {
  if (typeof window === 'undefined') return null

  return (window as any).__nextRouterShim || createRouterShim()
}


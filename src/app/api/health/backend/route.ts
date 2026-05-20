import { NextResponse } from 'next/server'

const DEFAULT_HEALTH_URL = 'https://club.nibdev.com/health'

export type BackendHealthBody = {
  status?: string
}

/**
 * Server-side probe: can this Node process reach the backend health endpoint?
 * Set BACKEND_HEALTH_URL to override (see .env.example).
 */
export async function GET() {
  const url = process.env.BACKEND_HEALTH_URL || DEFAULT_HEALTH_URL

  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(10_000),
      cache: 'no-store',
      headers: { Accept: '*/*' }
    })

    let body: BackendHealthBody | null = null
    const contentType = res.headers.get('content-type') ?? ''

    if (contentType.includes('application/json')) {
      try {
        body = (await res.json()) as BackendHealthBody
      } catch {
        body = null
      }
    }

    const healthy = res.status === 200 && body?.status === 'healthy'

    return NextResponse.json({
      ok: healthy,
      status: res.status,
      statusText: res.statusText,
      url,
      body,
      healthy
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)

    return NextResponse.json(
      {
        ok: false,
        status: 0,
        statusText: 'fetch_failed',
        error: message,
        url,
        body: null,
        healthy: false
      },
      { status: 502 }
    )
  }
}

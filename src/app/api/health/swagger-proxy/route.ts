import { NextResponse } from 'next/server'

const DEFAULT_SWAGGER_URL = 'http://192.168.8.199:8070/swagger/index.html'

/**
 * Server-side probe: can this Node process reach the company Swagger URL?
 * Set BACKEND_SWAGGER_TEST_URL to override (see .env.example).
 */
export async function GET() {
  const url = process.env.BACKEND_SWAGGER_TEST_URL || DEFAULT_SWAGGER_URL

  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(10_000),
      cache: 'no-store',
      headers: { Accept: 'text/html,application/json,*/*' }
    })

    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      url
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)

    return NextResponse.json(
      {
        ok: false,
        status: 0,
        statusText: 'fetch_failed',
        error: message,
        url
      },
      { status: 502 }
    )
  }
}

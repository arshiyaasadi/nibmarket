import { NextRequest, NextResponse } from 'next/server'

import { API_BACKEND_URL } from 'src/configs/api'

const PROXY_TIMEOUT_MS = 60_000

type RouteContext = {
  params: Promise<{ path?: string[] }>
}

function buildBackendUrl(pathSegments: string[], search: string): string {
  const pathname = pathSegments.filter(Boolean).join('/')
  const base = `${API_BACKEND_URL}/api/v1/${pathname}`

  return search ? `${base}${search}` : base
}

function forwardRequestHeaders(request: NextRequest): Headers {
  const headers = new Headers()
  const forward = ['authorization', 'accept', 'content-type', 'accept-language'] as const

  for (const name of forward) {
    const value = request.headers.get(name)
    if (value) headers.set(name, value)
  }

  return headers
}

async function proxyToBackend(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { path = [] } = await context.params
  const targetUrl = buildBackendUrl(path, request.nextUrl.search)

  const init: RequestInit = {
    method: request.method,
    headers: forwardRequestHeaders(request),
    cache: 'no-store',
    signal: AbortSignal.timeout(PROXY_TIMEOUT_MS)
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.arrayBuffer()
  }

  try {
    const upstream = await fetch(targetUrl, init)
    const body = await upstream.arrayBuffer()
    const headers = new Headers()
    const contentType = upstream.headers.get('content-type')

    if (contentType) headers.set('content-type', contentType)

    return new NextResponse(body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)

    return NextResponse.json(
      { error: 'upstream_fetch_failed', message, targetUrl },
      { status: 502 }
    )
  }
}

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyToBackend(request, context)
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyToBackend(request, context)
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxyToBackend(request, context)
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxyToBackend(request, context)
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyToBackend(request, context)
}

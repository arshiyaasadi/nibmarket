import { NextResponse } from 'next/server'

import { readBuildInfo } from 'src/lib/build-info'

export const dynamic = 'force-dynamic'

export async function GET() {
  const info = await readBuildInfo()

  return NextResponse.json({
    ok: true,
    ...info,
    isProduction: info.environment === 'production'
  })
}

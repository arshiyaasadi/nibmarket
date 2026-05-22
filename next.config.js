/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')

/** @type {import('next').NextConfig} */

// Remove this if you're not using Fullcalendar features

const apiBackendUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '')

module.exports = {
  output: 'standalone',
  trailingSlash: true,
  reactStrictMode: false,
  async rewrites() {
    if (!apiBackendUrl || apiBackendUrl.startsWith('/')) return []

    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiBackendUrl}/api/v1/:path*`
      }
    ]
  },
  // Both app/ and pages/ directories can coexist in Next.js 15
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      apexcharts: path.resolve(__dirname, './node_modules/apexcharts-clevision')
    }

    // Only alias next/router on client-side for App Router compatibility
    if (!isServer) {
      config.resolve.alias['next/router'] = path.resolve(__dirname, './src/lib/next-router-shim.ts')
    }

    return config
  },
  // Turbopack configuration to work alongside webpack config
  turbopack: {}
}

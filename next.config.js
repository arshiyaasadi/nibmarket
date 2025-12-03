/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')

/** @type {import('next').NextConfig} */

// Remove this if you're not using Fullcalendar features

module.exports = {
  trailingSlash: true,
  reactStrictMode: false,
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
  }
}

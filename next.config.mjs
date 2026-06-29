import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  serverExternalPackages: ["@prisma/client", "pg"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // typedRoutes: true, // فعال‌سازی بعد از اینکه همه redirectهای dynamic به RouteImpl cast شوند
  images: {
    remotePatterns: [],
    formats: ["image/avif", "image/webp"],
  },
};

export default withNextIntl(nextConfig);

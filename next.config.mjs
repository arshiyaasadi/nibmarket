import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Smaller Docker runtime: no second yarn install after build
  output: "standalone",
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // typedRoutes: true, // فعال‌سازی بعد از اینکه همه redirectهای dynamic به RouteImpl cast شوند
  images: {
    remotePatterns: [],
    formats: ["image/avif", "image/webp"],
  },
  /**
   * Exact static landings — beforeFiles so this wins over `app/page.tsx`
   * (proxy rewrite alone is unreliable in standalone Docker).
   */
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", destination: "/landing-v2/index.html" },
        { source: "/landing-legacy", destination: "/landing-v1/index.html" },
        { source: "/landing-legacy/", destination: "/landing-v1/index.html" },
      ],
    };
  },
};

export default withNextIntl(nextConfig);

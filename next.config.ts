import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ⚠️ CRITICAL: This allows production builds even with TypeScript errors
  typescript: {
    ignoreBuildErrors: true,
  },
  // ⚠️ CRITICAL: This allows production builds even with ESLint errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;

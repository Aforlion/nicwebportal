import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // ⚠️ CRITICAL: This allows production builds even with TypeScript errors
  typescript: {
    ignoreBuildErrors: true,
  },
  // ⚠️ CRITICAL: This allows production builds even with ESLint errors
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

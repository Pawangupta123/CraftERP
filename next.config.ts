import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project (a parent lockfile exists on the machine).
  turbopack: {
    root: import.meta.dirname,
  },
  experimental: {
    // Product photos are compressed client-side before upload (see lib/compress-image),
    // but raise both body limits as a safety net. The proxy (middleware) truncates the
    // request body at proxyClientMaxBodySize, which caused "Unexpected end of form".
    serverActions: {
      bodySizeLimit: '10mb',
    },
    proxyClientMaxBodySize: '10mb',
  },
};

export default nextConfig;

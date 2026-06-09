import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project (a parent lockfile exists on the machine).
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;

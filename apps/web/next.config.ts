import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@monorepo/shared", "@monorepo/db"],
};

export default nextConfig;

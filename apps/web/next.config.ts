import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@monorepo/shared"],
};

export default nextConfig;

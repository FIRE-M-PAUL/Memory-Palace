import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["three"],
  serverExternalPackages: ["officeparser"],
};

export default nextConfig;

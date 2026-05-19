import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["three"],
  serverExternalPackages: ["officeparser", "openai"],
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@react-three/drei",
      "@react-three/fiber",
      "three",
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization = config.optimization ?? {};
      config.optimization.splitChunks = config.optimization.splitChunks ?? {};
      const splitChunks = config.optimization.splitChunks as {
        cacheGroups?: Record<string, unknown>;
      };
      splitChunks.cacheGroups = {
        ...splitChunks.cacheGroups,
        three: {
          test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
          name: "three-vendor",
          chunks: "async",
          priority: 40,
        },
      };
    }
    return config;
  },
};

export default nextConfig;

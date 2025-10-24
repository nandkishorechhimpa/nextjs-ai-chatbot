import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdf-parse'],
  experimental: {
    // ppr: true,
    reactCompiler: false,
  },
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
  images: {
    remotePatterns: [
      {
        hostname: "avatar.vercel.sh",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)", // all routes
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors https://www.wearecyborg.com", // replace with your company domain
          },
          {
            key: "X-Frame-Options",
            value: "ALLOW-FROM https://www.wearecyborg.com", // optional fallback
          },
        ],
      },
    ];
  },
};

export default nextConfig;

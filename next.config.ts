import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
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
            value: "frame-ancestors http://localhost:3000/", // replace with your company domain
          },
          {
            key: "X-Frame-Options",
            value: "ALLOW-FROM http://localhost:3000/", // optional fallback
          },
        ],
      },
    ];
  },
};

export default nextConfig;

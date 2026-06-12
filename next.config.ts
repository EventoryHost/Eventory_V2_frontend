import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.107", "http://192.168.0.107:3000", "http://192.168.0.107"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d1u34m45xfa3ar.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "dkuacgndftndz.cloudfront.net",
      }
    ],
  },
};

export default nextConfig;

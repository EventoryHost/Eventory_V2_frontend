import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.107", "http://192.168.0.107:3000", "http://192.168.0.107", "192.168.0.106", "http://192.168.0.106:3000", "http://192.168.0.106"],
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
  env: {
    APP_AWS_REGION: process.env.APP_AWS_REGION,
    APP_AWS_ACCESS_KEY_ID: process.env.APP_AWS_ACCESS_KEY_ID,
    APP_AWS_SECRET_ACCESS_KEY: process.env.APP_AWS_SECRET_ACCESS_KEY,
    APP_AWS_S3_BUCKET_NAME: process.env.APP_AWS_S3_BUCKET_NAME,
    CLOUDFRONT_DOMAIN: process.env.CLOUDFRONT_DOMAIN,
  },
};

export default nextConfig;

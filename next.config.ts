import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.103", "http://192.168.0.103:3000", "http://192.168.0.103", "192.168.1.26", "http://192.168.1.26:3000", "http://192.168.1.26", "192.168.1.3", "http://192.168.1.3:3000", "http://192.168.1.3", "192.168.0.107", "http://192.168.0.107:3000", "http://192.168.0.107", "192.168.0.106", "http://192.168.0.106:3000", "http://192.168.0.106", "192.168.1.2", "http://192.168.1.2:3000", "http://192.168.1.2", "192.168.1.23", "http://192.168.1.23:3000", "http://192.168.1.23"],
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

import type { NextConfig } from "next";
import os from "os";

// Generate all possible local network IPs & subnets dynamically so mobile devices on any Wi-Fi/Hotspot are allowed
const generateAllowedDevOrigins = (): string[] => {
  const origins = new Set<string>([
    "*",
    "*.local",
    "localhost",
    "127.0.0.1",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ]);

  // Common subnets (0..254 for 192.168.0.x, 192.168.1.x, 192.168.2.x, 192.168.29.x, 192.168.43.x, 172.20.10.x, etc.)
  const commonSubnets = [
    "192.168.0",
    "192.168.1",
    "192.168.2",
    "192.168.29",
    "192.168.43",
    "192.168.8",
    "172.20.10",
    "10.0.0",
  ];

  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name] || []) {
        if (iface.family === "IPv4" && !iface.internal) {
          const parts = iface.address.split(".");
          if (parts.length === 4) {
            const activeSubnet = `${parts[0]}.${parts[1]}.${parts[2]}`;
            if (!commonSubnets.includes(activeSubnet)) {
              commonSubnets.push(activeSubnet);
            }
          }
        }
      }
    }
  } catch (e) {
    // Ignore fallback
  }

  for (const subnet of commonSubnets) {
    for (let i = 1; i <= 254; i++) {
      const ip = `${subnet}.${i}`;
      origins.add(ip);
      origins.add(`http://${ip}`);
      origins.add(`http://${ip}:3000`);
      origins.add(`https://${ip}`);
      origins.add(`https://${ip}:3000`);
    }
  }

  return Array.from(origins);
};

const nextConfig: NextConfig = {
  allowedDevOrigins: generateAllowedDevOrigins(),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d1u34m45xfa3ar.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "dkuacgndftndz.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
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

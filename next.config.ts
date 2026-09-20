import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow phone / LAN access during `next dev`
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.0.101",
    "192.168.0.100",
    "192.168.0.102",
    "192.168.1.1",
    "192.168.1.100",
    "192.168.1.101",
  ],
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow LAN access during `next dev` (phone/other machines on Wi‑Fi)
  allowedDevOrigins: ["192.168.0.101", "127.0.0.1", "localhost"],
};

export default nextConfig;

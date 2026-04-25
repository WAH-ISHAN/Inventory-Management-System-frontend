import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    BACKEND_URL: process.env.BACKEND_URL || "https://inventory-management-system-backend-hapd.onrender.com",
  },
};

export default nextConfig;

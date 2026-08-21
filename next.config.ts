import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  // Keep native Postgres driver out of the webpack graph (Railway / Next server).
  serverExternalPackages: ["pg", "pg-native"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;

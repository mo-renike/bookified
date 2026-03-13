import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "covers.openlibrary.org",
      },
    ],
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: `${process.env.API_BASE_URL}/:path*`,
        destination: `${process.env.BACKEND_URL}${process.env.API_BASE_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;

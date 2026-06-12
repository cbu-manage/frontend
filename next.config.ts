import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "https://15.165.190.216/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;

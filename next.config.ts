import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * 로컬/프리뷰 테스트용: /api/v1 요청을 백엔드로 프록시
   * .env.local 에 BACKEND_URL=http://localhost:8080 처럼 백엔드 주소 설정
   * NEXT_PUBLIC_API_URL 을 비우면 클라이언트는 같은 origin(/api/v1)으로 요청 → 이 rewrites 가 프록시
   */
  async rewrites() {
    const backend = process.env.BACKEND_URL;
    if (!backend) return [];
    const base = backend.replace(/\/$/, "");
    return [
      {
        source: "/api/v1/:path*",
        destination: `${base}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;

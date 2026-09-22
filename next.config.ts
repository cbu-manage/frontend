import type { NextConfig } from "next";

// API 프록시는 BFF 라우트 핸들러(src/app/api/v1/[...path]/route.ts)가 담당한다.
// 백엔드 주소는 BACKEND_URL 서버 환경변수로만 주입되며, 여기(클라이언트 노출 설정)에는 두지 않는다.
const nextConfig: NextConfig = {};

export default nextConfig;

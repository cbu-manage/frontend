import type { MetadataRoute } from "next";

const SITE_URL = "https://www.tukcbu.com";

/**
 * 로그인 없이 접근 가능한 공개 경로만 포함.
 * 회원 전용 페이지(게시판·자료방·마이페이지 등)는 로그인으로 리다이렉트되므로 제외.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const publicPaths = ["", "/apply", "/login", "/signup"];
  return publicPaths.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.6,
  }));
}

import type { MetadataRoute } from "next";

const SITE_URL = "https://www.tukcbu.com";

/**
 * 공개 색인 허용, 비공개/내부 경로는 차단하고 sitemap 위치를 알린다.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/manage/", "/user/", "/private/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

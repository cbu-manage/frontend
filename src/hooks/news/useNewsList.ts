"use client";

import { useQuery } from "@tanstack/react-query";
import {
  newsApi,
  type NewsCategory,
  type NewsletterType,
  type NewsListResponse,
} from "@/api";

export type UseNewsListParams = {
  category?: NewsCategory | NewsCategory[];
  newsletterType?: NewsletterType | NewsletterType[];
  keyword?: string;
  page: number;
  size?: number;
};

export function useNewsList({
  category,
  newsletterType,
  keyword,
  page,
  size = 11,
}: UseNewsListParams) {
  const categoryKey = Array.isArray(category) ? category.join(",") : category;
  const newsletterTypeKey = Array.isArray(newsletterType)
    ? newsletterType.join(",")
    : newsletterType;
  return useQuery({
    queryKey: [
      "news-list",
      categoryKey,
      newsletterTypeKey,
      keyword,
      page,
      size,
    ],
    queryFn: async (): Promise<NewsListResponse> => {
      const res = await newsApi.getList({
        category,
        newsletterType,
        keyword: keyword || undefined,
        page: page - 1,
        size,
      });
      return res.data.data;
    },
  });
}

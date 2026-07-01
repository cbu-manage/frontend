"use client";

import { useQuery } from "@tanstack/react-query";
import { newsApi, type NewsCategory, type NewsListResponse } from "@/api";

export type UseNewsListParams = {
  category?: NewsCategory | NewsCategory[];
  keyword?: string;
  page: number;
  size?: number;
};

export function useNewsList({ category, keyword, page, size = 11 }: UseNewsListParams) {
  const categoryKey = Array.isArray(category) ? category.join(",") : category;
  return useQuery({
    queryKey: ["news-list", categoryKey, keyword, page, size],
    queryFn: async (): Promise<NewsListResponse> => {
      const res = await newsApi.getList({
        category,
        keyword: keyword || undefined,
        page: page - 1,
        size,
      });
      return res.data.data;
    },
  });
}

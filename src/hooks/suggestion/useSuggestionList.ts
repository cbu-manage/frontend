"use client";

import { useQuery } from "@tanstack/react-query";
import {
  suggestionApi,
  type SuggestionListItem,
  type SuggestionType,
} from "@/api";

export const SUGGESTION_PAGE_SIZE = 15;

/** 목록·요약·상세가 같은 루트를 쓰므로 변경 후 한 번에 무효화한다 */
export const SUGGESTIONS_QUERY_KEY = ["suggestions"] as const;

export function useSuggestionList({
  page,
  type,
  size = SUGGESTION_PAGE_SIZE,
}: {
  /** 1부터 */
  page: number;
  type?: SuggestionType;
  size?: number;
}) {
  return useQuery({
    queryKey: [...SUGGESTIONS_QUERY_KEY, "list", page, type ?? "ALL", size],
    queryFn: async () => {
      const res = await suggestionApi.getList({
        page: page - 1,
        size,
        type,
      });
      const data = res.data.data;
      const items: SuggestionListItem[] = data?.content ?? [];
      const totalPages =
        typeof data?.totalPages === "number" && data.totalPages > 0
          ? data.totalPages
          : 1;
      return { items, totalPages };
    },
  });
}

export function useSuggestionSummary() {
  return useQuery({
    queryKey: [...SUGGESTIONS_QUERY_KEY, "summary"],
    queryFn: async () => {
      const res = await suggestionApi.getSummary();
      return res.data.data ?? { openCount: 0, resolvedCount: 0 };
    },
  });
}

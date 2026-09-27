"use client";

import { useQuery } from "@tanstack/react-query";
import {
  freeboardApi,
  type FreeBoardListItem,
  type FreeboardTopic,
} from "@/api";

function normalizeList(raw: unknown): {
  items: FreeBoardListItem[];
  totalPages: number;
} {
  if (!raw || typeof raw !== "object") return { items: [], totalPages: 1 };
  const obj = raw as Record<string, unknown>;
  const content = Array.isArray(obj.content)
    ? (obj.content as FreeBoardListItem[])
    : [];
  // 서버는 페이지 정보를 page 아래에 담아 준다. 예전처럼 최상위만 보면 항상 1쪽으로 보인다.
  const pageInfo = (obj.page ?? obj) as { totalPages?: number };
  const totalPages =
    typeof pageInfo.totalPages === "number" && pageInfo.totalPages > 0
      ? pageInfo.totalPages
      : 1;
  return { items: content, totalPages };
}

export function useFreeboardList({
  page,
  size = 15,
  topic,
}: {
  page: number;
  size?: number;
  topic?: FreeboardTopic;
}) {
  return useQuery({
    queryKey: ["freeboard-list", page, size, topic ?? "ALL"],
    queryFn: async () => {
      const res = await freeboardApi.getList({
        page: page - 1,
        size,
        ...(topic ? { topic } : {}),
      });
      return normalizeList(res.data.data);
    },
  });
}

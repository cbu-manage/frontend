"use client";

import { useQuery } from "@tanstack/react-query";
import { freeboardApi, type FreeBoardListItem } from "@/api";

function normalizeList(raw: unknown): { items: FreeBoardListItem[]; totalPages: number } {
  if (!raw || typeof raw !== "object") return { items: [], totalPages: 1 };
  const obj = raw as Record<string, unknown>;
  const content = Array.isArray(obj.content) ? (obj.content as FreeBoardListItem[]) : [];
  const totalPages =
    typeof obj.totalPages === "number" && obj.totalPages > 0 ? obj.totalPages : 1;
  return { items: content, totalPages };
}

export function useFreeboardList({ page, size = 15 }: { page: number; size?: number }) {
  return useQuery({
    queryKey: ["freeboard-list", page, size],
    queryFn: async () => {
      const res = await freeboardApi.getList({ page: page - 1, size });
      return normalizeList(res.data.data);
    },
  });
}

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resourcesApi, type ResourceListParams, type ResourceItem } from "@/api";

type UseResourceListParams = {
  page: number;
  size: number;
};

type NormalizedList = {
  items: ResourceItem[];
  totalPages: number;
};

function normalizeList(raw: unknown): NormalizedList {
  if (Array.isArray(raw)) {
    return { items: raw as ResourceItem[], totalPages: 1 };
  }

  const obj = raw as { content?: ResourceItem[]; totalPages?: number } | null;
  if (obj && Array.isArray(obj.content)) {
    return {
      items: obj.content,
      totalPages: typeof obj.totalPages === "number" ? obj.totalPages : 1,
    };
  }

  return { items: [], totalPages: 1 };
}

export function useResourceList({ page, size }: UseResourceListParams) {
  return useQuery({
    queryKey: ["resources", page, size],
    queryFn: async () => {
      const params: ResourceListParams = {
        page: Math.max(page - 1, 0),
        size,
      };
      const res = await resourcesApi.getList(params);
      const payload =
        res.data && typeof res.data === "object" && "data" in res.data
          ? (res.data as { data?: unknown }).data
          : res.data;
      return normalizeList(payload);
    },
  });
}

export function useDeleteResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await resourcesApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
  });
}


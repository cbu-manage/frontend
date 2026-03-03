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

function normalizeList(raw: any): NormalizedList {
  if (Array.isArray(raw)) {
    return { items: raw, totalPages: 1 };
  }

  if (raw && Array.isArray(raw.content)) {
    return {
      items: raw.content,
      totalPages: typeof raw.totalPages === "number" ? raw.totalPages : 1,
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
      return normalizeList(res.data);
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


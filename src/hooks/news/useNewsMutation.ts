"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { newsApi, type NewsCreateBody, type NewsUpdateBody } from "@/api";

export function useNewsCreate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: NewsCreateBody) => newsApi.create(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["news-list"] }),
  });
}

export function useNewsUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: NewsUpdateBody }) =>
      newsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news-list"] });
      queryClient.invalidateQueries({ queryKey: ["news"] });
    },
  });
}

export function useNewsPin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, pinned }: { id: number; pinned: boolean }) =>
      newsApi.pin(id, pinned),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["news-list"] }),
  });
}

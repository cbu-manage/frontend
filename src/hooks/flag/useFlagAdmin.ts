"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { flagApi } from "@/api";

export const FLAG_PAGE_SIZE = 10;

/** 신고 관리 쿼리 키 루트 — 처리 후 목록·상세를 한 번에 무효화할 때 사용 */
export const FLAGS_QUERY_KEY = ["flags"] as const;

/** 게시글 신고 목록. page 는 UI 기준 1부터, 서버엔 0부터 넘긴다 */
export function useFlagPostList(page: number, size = FLAG_PAGE_SIZE) {
  return useQuery({
    queryKey: [...FLAGS_QUERY_KEY, "post", page, size],
    queryFn: async () => {
      const res = await flagApi.getPostFlags({ page: page - 1, size });
      const data = res.data.data;
      return {
        items: data?.content ?? [],
        totalPages: data?.totalPages ?? 1,
        totalElements: data?.totalElements ?? 0,
      };
    },
  });
}

export function useFlagPostDetail(flagPostId: number | null) {
  return useQuery({
    queryKey: [...FLAGS_QUERY_KEY, "post", "detail", flagPostId],
    queryFn: async () => {
      const res = await flagApi.getPostFlag(flagPostId as number);
      return res.data.data;
    },
    enabled: flagPostId !== null,
  });
}

/** 대상 게시글의 신고를 모두 처리 완료로. 성공 시 신고 목록·상세 전부 갱신 */
export function useResolvePostFlags() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) => flagApi.resolvePostFlags(postId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: FLAGS_QUERY_KEY });
    },
  });
}

/** 댓글 신고 목록. page 는 UI 기준 1부터 */
export function useFlagCommentList(page: number, size = FLAG_PAGE_SIZE) {
  return useQuery({
    queryKey: [...FLAGS_QUERY_KEY, "comment", page, size],
    queryFn: async () => {
      const res = await flagApi.getCommentFlags({ page: page - 1, size });
      const data = res.data.data;
      return {
        items: data?.content ?? [],
        totalPages: data?.totalPages ?? 1,
        totalElements: data?.totalElements ?? 0,
      };
    },
  });
}

export function useFlagCommentDetail(flagCommentId: number | null) {
  return useQuery({
    queryKey: [...FLAGS_QUERY_KEY, "comment", "detail", flagCommentId],
    queryFn: async () => {
      const res = await flagApi.getCommentFlag(flagCommentId as number);
      return res.data.data;
    },
    enabled: flagCommentId !== null,
  });
}

/** 대상 댓글의 신고를 모두 처리 완료로 */
export function useResolveCommentFlags() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: number) => flagApi.resolveCommentFlags(commentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: FLAGS_QUERY_KEY });
    },
  });
}

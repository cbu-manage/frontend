"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  freeboardApi,
  commentApi,
  postApi,
  extractCommentList,
  type FreeBoardPost,
  type CommentItem,
} from "@/api";
import { formatDate } from "@/lib/date";

export type MappedComment = {
  id: number;
  author: string;
  userId?: number;
  content: string;
  date: string;
  deleted?: boolean;
  replies: MappedComment[];
};

function mapComment(c: CommentItem): MappedComment {
  const name = c.userName ?? c.authorName;
  return {
    id: c.commentId,
    // 댓글별 isAnonymous 분기 — 익명 댓글엔 작성자 필드 자체가 없음
    author: name
      ? c.generation != null
        ? `${c.generation}기 ${name}`
        : name
      : "익명",
    userId: c.userId,
    content: c.content,
    date: c.createdAt ? formatDate(c.createdAt) : "",
    deleted: c.deleted,
    replies: (c.replies ?? []).map(mapComment),
  };
}

export function useFreeboardDetail(postId: number) {
  const queryClient = useQueryClient();

  const postQuery = useQuery({
    queryKey: ["freeboard", postId],
    queryFn: async () => {
      const res = await freeboardApi.getById(postId);
      return res.data.data ?? null;
    },
    enabled: !!postId,
  });

  // 댓글 목록 — 자게 전용 단일 엔드포인트, 댓글별 isAnonymous로 스키마 분기
  const commentsQuery = useQuery({
    queryKey: ["freeboard-comments", postId],
    queryFn: async () => {
      const res = await freeboardApi.getComments(postId);
      return extractCommentList(res.data).map(mapComment);
    },
    enabled: !!postId,
  });

  const createComment = useMutation({
    // 익명 여부는 쿼리 파라미터 — 익명 글이면 서버가 값과 무관하게 익명 처리
    mutationFn: ({
      content,
      isAnonymous,
    }: {
      content: string;
      isAnonymous: boolean;
    }) => freeboardApi.createComment(postId, content, isAnonymous),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["freeboard-comments", postId],
      }),
  });

  const replyComment = useMutation({
    mutationFn: ({
      commentId,
      content,
    }: {
      commentId: number;
      content: string;
    }) => commentApi.reply(commentId, { content }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["freeboard-comments", postId],
      }),
  });

  const deleteComment = useMutation({
    mutationFn: (commentId: number) => commentApi.delete(commentId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["freeboard-comments", postId],
      }),
  });

  const deletePost = useMutation({
    mutationFn: () => postApi.delete(postId),
  });

  const flagPost = useMutation({
    mutationFn: (content: string) => freeboardApi.flag(postId, content),
  });

  const flagComment = useMutation({
    mutationFn: ({
      commentId,
      content,
    }: {
      commentId: number;
      content: string;
    }) => commentApi.flag(commentId, content),
  });

  return {
    postQuery,
    commentsQuery,
    createComment,
    replyComment,
    deleteComment,
    deletePost,
    flagPost,
    flagComment,
  };
}

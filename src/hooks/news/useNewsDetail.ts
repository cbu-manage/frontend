"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  newsApi,
  commentApi,
  extractCommentList,
  type CommentItem,
} from "@/api";
import { formatDate } from "@/lib/date";
import type { MappedComment } from "@/hooks/board/useFreeboardDetail";

function mapComment(c: CommentItem): MappedComment {
  return {
    id: c.commentId,
    author: c.userName ?? c.authorName ?? "알 수 없음",
    userId: c.userId,
    content: c.content,
    date: c.createdAt ? formatDate(c.createdAt) : "",
    deleted: c.deleted,
    replies: (c.replies ?? []).map(mapComment),
  };
}

export function useNewsDetail(newsId: number) {
  const queryClient = useQueryClient();

  const postQuery = useQuery({
    queryKey: ["news", newsId],
    queryFn: async () => {
      const res = await newsApi.getById(newsId);
      return res.data.data;
    },
    enabled: !!newsId,
  });

  const postId = postQuery.data?.postId;

  const commentsQuery = useQuery({
    queryKey: ["news-comments", postId],
    queryFn: async () => {
      const res = await commentApi.getPostComments(postId!);
      return extractCommentList(res.data).map(mapComment);
    },
    enabled: !!postId,
  });

  const createComment = useMutation({
    mutationFn: ({ content }: { content: string }) =>
      commentApi.createPostComment(postId!, { content }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["news-comments", postId] }),
  });

  const replyComment = useMutation({
    mutationFn: ({ commentId, content }: { commentId: number; content: string }) =>
      commentApi.reply(commentId, { content }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["news-comments", postId] }),
  });

  const updateComment = useMutation({
    mutationFn: ({ commentId, content }: { commentId: number; content: string }) =>
      commentApi.update(commentId, { content }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["news-comments", postId] }),
  });

  const deleteComment = useMutation({
    mutationFn: (commentId: number) => commentApi.delete(commentId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["news-comments", postId] }),
  });

  const deletePost = useMutation({
    mutationFn: () => newsApi.delete(newsId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["news-list"] }),
  });

  const flagComment = useMutation({
    mutationFn: ({ commentId, content }: { commentId: number; content: string }) =>
      commentApi.flag(commentId, content),
  });

  return {
    postQuery,
    commentsQuery,
    createComment,
    replyComment,
    updateComment,
    deleteComment,
    deletePost,
    flagComment,
  };
}

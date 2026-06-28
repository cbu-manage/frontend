"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { freeboardApi, commentApi, postApi, extractCommentList, type FreeBoardPost, type CommentItem } from "@/api";
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
  return {
    id: c.commentId,
    author: c.userName ?? c.authorName ?? "익명",
    userId: c.userId,
    content: c.content,
    date: c.createdAt ? formatDate(c.createdAt) : "",
    deleted: c.deleted,
    replies: (c.replies ?? []).map(mapComment),
  };
}

function extractPost(raw: unknown): FreeBoardPost | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  return (("data" in obj ? obj.data : obj) ?? null) as FreeBoardPost | null;
}

export function useFreeboardDetail(postId: number) {
  const queryClient = useQueryClient();

  const postQuery = useQuery({
    queryKey: ["freeboard", postId],
    queryFn: async () => {
      const res = await freeboardApi.getById(postId);
      return extractPost(res.data);
    },
    enabled: !!postId,
  });

  const commentsQuery = useQuery({
    queryKey: ["freeboard-comments", postId],
    queryFn: async () => {
      const res = await commentApi.getPostComments(postId);
      return extractCommentList(res.data).map(mapComment);
    },
    enabled: !!postId,
  });

  const createComment = useMutation({
    mutationFn: (content: string) =>
      commentApi.createPostComment(postId, { content }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["freeboard-comments", postId] }),
  });

  const replyComment = useMutation({
    mutationFn: ({ commentId, content }: { commentId: number; content: string }) =>
      commentApi.reply(commentId, { content }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["freeboard-comments", postId] }),
  });

  const deleteComment = useMutation({
    mutationFn: (commentId: number) => commentApi.delete(commentId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["freeboard-comments", postId] }),
  });

  const deletePost = useMutation({
    mutationFn: () => postApi.delete(postId),
  });

  const flagPost = useMutation({
    mutationFn: (content: string) => freeboardApi.flag(postId, content),
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
    deleteComment,
    deletePost,
    flagPost,
    flagComment,
  };
}

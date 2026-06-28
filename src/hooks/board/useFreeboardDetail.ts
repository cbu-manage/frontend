"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { freeboardApi, commentApi, postApi, extractCommentList, type FreeBoardPost } from "@/api";

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
      return extractCommentList(res.data);
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
    mutationFn: () => freeboardApi.flag(postId),
  });

  return {
    postQuery,
    commentsQuery,
    createComment,
    replyComment,
    deleteComment,
    deletePost,
    flagPost,
  };
}

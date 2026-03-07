"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { commentApi, extractCommentList, type CommentItem } from "@/api/comment.api";

export type NormalizedComment = {
  id: number;
  author: string;
  content: string;
  date: string;
  replies: NormalizedComment[];
  deleted?: boolean;
};

function formatDate(iso?: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).replace(/\. /g, ". ");
  } catch {
    return iso;
  }
}

function toAuthor(item: CommentItem): string {
  if (item.deleted) return "(삭제된 댓글)";
  const name = item.authorName ?? "익명";
  const gen = item.authorGeneration;
  return gen != null ? `${gen}기 ${name}` : name;
}

function normalize(item: CommentItem): NormalizedComment {
  return {
    id: item.commentId,
    author: toAuthor(item),
    content: item.deleted ? "(삭제된 댓글입니다.)" : (item.content ?? ""),
    date: formatDate(item.createdAt as string),
    replies: (item.replies ?? []).map(normalize),
    deleted: item.deleted,
  };
}

export function useProblemComments(problemId: number) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["problemComments", problemId],
    queryFn: () => commentApi.getProblemComments(problemId),
    enabled: !!problemId && !Number.isNaN(problemId),
  });

  const createMutation = useMutation({
    mutationFn: (content: string) =>
      commentApi.createProblemComment(problemId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problemComments", problemId] });
    },
  });

  const replyMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: number; content: string }) =>
      commentApi.reply(commentId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problemComments", problemId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: number; content: string }) =>
      commentApi.update(commentId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problemComments", problemId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: number) => commentApi.delete(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problemComments", problemId] });
    },
  });

  const list = extractCommentList(query.data);
  const comments: NormalizedComment[] = list.map(normalize);

  return {
    comments,
    isLoading: query.isLoading,
    refetch: query.refetch,
    createComment: (content: string) => createMutation.mutateAsync(content),
    replyComment: (commentId: number, content: string) =>
      replyMutation.mutateAsync({ commentId, content }),
    updateComment: (commentId: number, content: string) =>
      updateMutation.mutateAsync({ commentId, content }),
    deleteComment: (commentId: number) => deleteMutation.mutateAsync(commentId),
    isCreating: createMutation.isPending,
    isReplying: replyMutation.isPending,
  };
}

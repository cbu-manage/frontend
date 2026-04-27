"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { commentApi, extractCommentList, type CommentItem } from "@/api/comment.api";

export type NormalizedComment = {
  id: number;
  author: string;
  authorName?: string;
  userId?: number;
  content: string;
  date: string;
  replies: NormalizedComment[];
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
  const name = item.userName ?? item.authorName ?? "익명";
  const gen = item.generation ?? item.authorGeneration;
  return gen != null ? `${gen}기 ${name}` : name;
}

function extractId(item: CommentItem): number {
  const raw = item as Record<string, unknown>;
  const val = item.commentId ?? raw.id ?? raw.replyId;
  return typeof val === "number" ? val : Number(val) || 0;
}

/** 백엔드: deleted 필드 없이 content가 "삭제된 댓글입니다"로 내려옴 */
function isDeleted(item: CommentItem): boolean {
  if (item.deleted) return true;
  const content = (item.content ?? "").trim();
  return content === "삭제된 댓글입니다" || content === "삭제된 댓글입니다.";
}

function normalize(item: CommentItem): NormalizedComment {
  const raw = item as Record<string, unknown>;
  return {
    id: extractId(item),
    author: toAuthor(item),
    authorName: (item.userName ?? item.authorName) ?? undefined,
    userId: typeof raw.userId === "number" ? (raw.userId as number) : undefined,
    content: item.content ?? "",
    date: formatDate(item.createdAt as string),
    replies: (item.replies ?? []).filter((r) => !isDeleted(r)).map(normalize),
  };
}

function filterDeleted(comments: CommentItem[]): CommentItem[] {
  return comments.filter((c) => !isDeleted(c));
}

export function useProblemComments(postId: number) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["problemComments", postId],
    queryFn: () => commentApi.getProblemComments(postId),
    enabled: !!postId && !Number.isNaN(postId),
  });

  const createMutation = useMutation({
    mutationFn: (content: string) =>
      commentApi.createProblemComment(postId, { content }),
    // TODO: react-query v6 onSuccess/onError/onSettled deprecation - 마이그레이션 검토
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problemComments", postId] });
    },
  });

  const replyMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: number; content: string }) =>
      commentApi.reply(commentId, { content }),
    // TODO: react-query v6 onSuccess/onError/onSettled deprecation - 마이그레이션 검토
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problemComments", postId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: number; content: string }) =>
      commentApi.update(commentId, { content }),
    // TODO: react-query v6 onSuccess/onError/onSettled deprecation - 마이그레이션 검토
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problemComments", postId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: number) => commentApi.delete(commentId),
    // TODO: react-query v6 onSuccess/onError/onSettled deprecation - 마이그레이션 검토
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problemComments", postId] });
    },
  });

  const list = extractCommentList(query.data);
  const comments: NormalizedComment[] = filterDeleted(list).map(normalize);

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

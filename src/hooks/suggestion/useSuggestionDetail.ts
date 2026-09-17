"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  suggestionApi,
  commentApi,
  type SuggestionComment,
  type SuggestionStatus,
} from "@/api";
import { formatDate } from "@/lib/date";
import { SUGGESTIONS_QUERY_KEY } from "./useSuggestionList";

/** CommentItem 이 받는 모양. 작성자는 항상 "익명", 본인 여부는 isMine 으로만 전달 */
export type MappedSuggestionComment = {
  id: number;
  author: string;
  content: string;
  date: string;
  deleted?: boolean;
  isMine: boolean;
  replies: MappedSuggestionComment[];
};

/** 서버는 flat 배열(parentCommentId)로 주므로 1단계 트리로 묶는다 */
function buildTree(flat: SuggestionComment[]): MappedSuggestionComment[] {
  const toNode = (c: SuggestionComment): MappedSuggestionComment => ({
    id: c.commentId,
    author: "익명",
    content: c.content,
    date: c.createdAt ? formatDate(c.createdAt) : "",
    deleted: c.isDeleted,
    isMine: c.isAuthor,
    replies: [],
  });
  const nodes = new Map<number, MappedSuggestionComment>();
  const roots: MappedSuggestionComment[] = [];
  for (const c of flat) nodes.set(c.commentId, toNode(c));
  for (const c of flat) {
    const node = nodes.get(c.commentId)!;
    const parent =
      c.parentCommentId != null ? nodes.get(c.parentCommentId) : undefined;
    if (parent) parent.replies.push(node);
    else roots.push(node);
  }
  return roots;
}

export function useSuggestionDetail(postId: number) {
  const queryClient = useQueryClient();
  const commentsKey = [...SUGGESTIONS_QUERY_KEY, "comments", postId];
  const postKey = [...SUGGESTIONS_QUERY_KEY, "detail", postId];

  const postQuery = useQuery({
    queryKey: postKey,
    queryFn: async () => {
      const res = await suggestionApi.getById(postId);
      return res.data.data ?? null;
    },
    enabled: !!postId,
  });

  const commentsQuery = useQuery({
    queryKey: commentsKey,
    queryFn: async () => {
      const res = await suggestionApi.getComments(postId);
      return buildTree(res.data.data ?? []);
    },
    enabled: !!postId,
  });

  const invalidateComments = () =>
    queryClient.invalidateQueries({ queryKey: commentsKey });

  const createComment = useMutation({
    mutationFn: (content: string) =>
      suggestionApi.createComment(postId, { content }),
    onSuccess: invalidateComments,
  });

  const replyComment = useMutation({
    mutationFn: ({
      commentId,
      content,
    }: {
      commentId: number;
      content: string;
    }) =>
      suggestionApi.createComment(postId, {
        content,
        parentCommentId: commentId,
      }),
    onSuccess: invalidateComments,
  });

  const deleteComment = useMutation({
    mutationFn: (commentId: number) => commentApi.delete(commentId),
    onSuccess: invalidateComments,
  });

  const deletePost = useMutation({
    mutationFn: () => suggestionApi.delete(postId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: SUGGESTIONS_QUERY_KEY }),
  });

  /** 운영진 전용. 상세·목록·요약 전부 갱신 */
  const updateStatus = useMutation({
    mutationFn: (status: SuggestionStatus) =>
      suggestionApi.updateStatus(postId, status),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: SUGGESTIONS_QUERY_KEY }),
  });

  const flagPost = useMutation({
    mutationFn: (content: string) => suggestionApi.flag(postId, content),
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
    updateStatus,
    flagPost,
    flagComment,
  };
}

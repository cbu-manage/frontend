"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  suggestionApi,
  commentApi,
  type SuggestionComment,
  type SuggestionPost,
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

const LIST_KEY = [...SUGGESTIONS_QUERY_KEY, "list"];
const SUMMARY_KEY = [...SUGGESTIONS_QUERY_KEY, "summary"];
const detailKey = (postId: number) => [
  ...SUGGESTIONS_QUERY_KEY,
  "detail",
  postId,
];
const commentsKeyOf = (postId: number) => [
  ...SUGGESTIONS_QUERY_KEY,
  "comments",
  postId,
];

/** 글 한 건만. 글쓰기(수정) 페이지처럼 댓글·뮤테이션이 필요 없는 곳에서 쓴다 */
export function useSuggestionPost(postId: number) {
  return useQuery({
    queryKey: detailKey(postId),
    queryFn: async () => {
      const res = await suggestionApi.getById(postId);
      return res.data.data ?? null;
    },
    enabled: !!postId,
  });
}

export function useSuggestionDetail(postId: number) {
  const queryClient = useQueryClient();
  const commentsKey = commentsKeyOf(postId);
  const postKey = detailKey(postId);

  const postQuery = useSuggestionPost(postId);

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

  /** 목록·요약만 다시 받는다. 상세를 다시 부르면 조회수가 오르고, 삭제 뒤엔 404 가 난다 */
  const invalidateListAndSummary = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: LIST_KEY }),
      queryClient.invalidateQueries({ queryKey: SUMMARY_KEY }),
    ]);

  const deletePost = useMutation({
    mutationFn: () => suggestionApi.delete(postId),
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: postKey });
      queryClient.removeQueries({ queryKey: commentsKey });
      await invalidateListAndSummary();
    },
  });

  /** 운영진 전용. 상세는 캐시를 직접 고쳐 재조회(조회수 증가)를 피한다 */
  const updateStatus = useMutation({
    mutationFn: (status: SuggestionStatus) =>
      suggestionApi.updateStatus(postId, status),
    onSuccess: async (_res, status) => {
      queryClient.setQueryData<SuggestionPost | null>(postKey, (old) =>
        old
          ? {
              ...old,
              status,
              resolvedAt:
                status === "RESOLVED" ? new Date().toISOString() : null,
            }
          : old,
      );
      await invalidateListAndSummary();
    },
  });

  /** ADMIN 전용. 목록 정렬이 바뀌므로 목록 무효화, 상세는 캐시 직접 수정 */
  const updatePinned = useMutation({
    mutationFn: (pinned: boolean) => suggestionApi.updatePinned(postId, pinned),
    onSuccess: async (_res, pinned) => {
      queryClient.setQueryData<SuggestionPost | null>(postKey, (old) =>
        old ? { ...old, isPinned: pinned } : old,
      );
      await invalidateListAndSummary();
    },
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
    updatePinned,
    flagPost,
    flagComment,
  };
}

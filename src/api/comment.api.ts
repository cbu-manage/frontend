/**
 * 댓글 API
 */
import { api } from "./client";

export type CommentBody = { content: string };

/** 댓글/답글 한 건 (목록 응답 - 1계층 트리) */
export type CommentItem = {
  commentId: number;
  content: string;
  // 백엔드 최신 스펙 필드
  userId?: number;
  generation?: number;
  userName?: string;
  // 구버전/다른 엔드포인트 호환 필드
  authorName?: string;
  authorGeneration?: number;
  createdAt?: string;
  replies?: CommentItem[];
  deleted?: boolean;
  [key: string]: unknown;
};

function extractCommentList(raw: unknown): CommentItem[] {
  if (!raw || typeof raw !== "object") return [];
  const obj = raw as Record<string, unknown>;
  const body = obj.data ?? obj;
  if (Array.isArray(body)) return body as CommentItem[];
  if (body && typeof body === "object" && "data" in body) {
    const inner = (body as { data?: unknown }).data;
    return Array.isArray(inner) ? (inner as CommentItem[]) : [];
  }
  return [];
}

export const commentApi = {
  /** 포스트 댓글 목록 (1계층 트리) */
  getPostComments: (postId: number) =>
    api.get<{ data?: CommentItem[] }>(`/post/${postId}/comment`),

  /** 포스트 댓글 작성 */
  createPostComment: (postId: number, data: CommentBody) =>
    api.post(`/post/${postId}/comment`, data),

  /**
   * 코딩테스트 문제 댓글 목록 (1계층 트리)
   *
   * 백엔드에서 코딩테스트 문제도 "post" 테이블을 통해 관리하므로
   * 문제 댓글 역시 공통 댓글 엔드포인트
   *   GET /api/v1/post/{postId}/comment
   * 를 사용한다.
   */
  getProblemComments: (problemPostId: number) =>
    api.get<{ data?: CommentItem[] }>(`/post/${problemPostId}/comment`),

  /**
   * 코딩테스트 문제 댓글 작성
   * POST /api/v1/post/{postId}/comment
   */
  createProblemComment: (problemPostId: number, data: CommentBody) =>
    api.post(`/post/${problemPostId}/comment`, data),

  /** 답글 추가 (commentId에 답글 달기, 답글에 달면 부모와 자동 연결) */
  reply: (commentId: number, data: CommentBody) =>
    api.post(`/comment/${commentId}/reply`, data),

  /** 댓글 수정 */
  update: (commentId: number, data: CommentBody) =>
    api.patch(`/comment/${commentId}`, data),

  /** 댓글 삭제 (softDelete) */
  delete: (commentId: number) => api.delete(`/comment/${commentId}`),
};

export { extractCommentList };

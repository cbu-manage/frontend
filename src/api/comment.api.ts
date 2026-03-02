/**
 * 댓글 API
 * - 포스트 댓글: /api/v1/post/{postId}/comment
 * - 코딩테스트 댓글: /api/v1/problems/{problemId}/comment
 * - 답글: /api/v1/comment/{commentId}/reply
 */
import { api } from "./client";

// TODO: 세부 타입 추가

export const commentApi = {
  /** 포스트 댓글 목록 조회 */
  getPostComments: (postId: number) =>
    api.get(`/post/${postId}/comment`),

  /** 포스트 댓글 작성 */
  createPostComment: (postId: number, data: unknown) =>
    api.post(`/post/${postId}/comment`, data),

  /** 코딩테스트 문제 댓글 목록 조회 */
  getProblemComments: (problemId: number) =>
    api.get(`/problems/${problemId}/comment`),

  /** 코딩테스트 문제 댓글 작성 */
  createProblemComment: (problemId: number, data: unknown) =>
    api.post(`/problems/${problemId}/comment`, data),

  /** 답글 추가 */
  reply: (commentId: number, data: unknown) =>
    api.post(`/comment/${commentId}/reply`, data),

  /** 댓글 수정 */
  update: (commentId: number, data: unknown) =>
    api.patch(`/comment/${commentId}`, data),

  /** 댓글 삭제 (softDelete) */
  delete: (commentId: number) => api.delete(`/comment/${commentId}`),
};

/**
 * 공통 포스트 API
 * - 카테고리별 포스트 목록: /api/v1/post
 * - 포스트 단건 조회: /api/v1/post/{postId}/post
 * - 포스트 삭제: /api/v1/post/{postId}
 */
import { api } from "./client";

// TODO: 세부 타입 추가
export type PostListParams = { category?: string; page?: number; size?: number };

export const postApi = {
  /** 카테고리별 포스트 목록 페이징 조회 */
  getList: (params?: PostListParams) => api.get("/post", { params }),

  /** 포스트 메인테이블 단건 조회 */
  getById: (postId: number) => api.get(`/post/${postId}/post`),

  /** 포스트 단건 삭제 (보고서 등) */
  delete: (postId: number) => api.delete(`/post/${postId}`),
};

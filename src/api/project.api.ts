/**
 * 프로젝트 모집 API
 * @see GET/POST /api/v1/post/project, /api/v1/post/project/{postId}...
 */
import { api } from "./client";

// TODO: 세부 타입 추가
export type ProjectListParams = { page?: number; size?: number };
export type ProjectFilterParams = { category?: string; page?: number; size?: number };

export const projectApi = {
  /** 프로젝트 게시글 전체 목록 페이징 조회 */
  getList: (params?: ProjectListParams) =>
    api.get("/post/project", { params }),

  /** 프로젝트 게시글 생성 */
  create: (data: unknown) => api.post("/post/project", data),

  /** 프로젝트 게시글 상세 조회 */
  getById: (postId: number) => api.get(`/post/project/${postId}`),

  /** 프로젝트 게시글 수정 */
  update: (postId: number, data: unknown) =>
    api.patch(`/post/project/${postId}`, data),

  /** 프로젝트 게시글 삭제 */
  delete: (postId: number) => api.delete(`/post/project/${postId}`),

  /** 내가 작성한 프로젝트 게시글 목록 조회 */
  getMyList: (params?: ProjectListParams) =>
    api.get("/post/project/me", { params }),

  /** 프로젝트 모집분야 카테고리별 목록 페이징 조회 */
  getFilteredList: (params?: ProjectFilterParams) =>
    api.get("/post/project/filter", { params }),
};

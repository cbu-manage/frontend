/**
 * 코딩테스트 문제 API
 * @see GET/POST /api/v1/post/problems, /api/v1/post/platforms, /api/v1/post/languages, /api/v1/post/categories
 */
import { api } from "./client";

// TODO: 세부 타입 추가
export type ProblemListParams = { page?: number; size?: number };

export const codingTestApi = {
  /** 코딩테스트 문제 목록 조회 */
  getList: (params?: ProblemListParams) =>
    api.get("/post/problems", { params }),

  /** 새 코딩테스트 문제 생성 */
  create: (data: unknown) => api.post("/post/problems", data),

  /** 문제 상세 정보 조회 */
  getById: (id: number) => api.get(`/post/problems/${id}`),

  /** 문제 정보 수정 */
  update: (id: number, data: unknown) =>
    api.patch(`/post/problems/${id}`, data),

  /** 문제 삭제 */
  delete: (id: number) => api.delete(`/post/problems/${id}`),

  /** 모든 플랫폼 목록 조회 */
  getPlatforms: () => api.get("/post/platforms"),

  /** 모든 언어 목록 조회 */
  getLanguages: () => api.get("/post/languages"),

  /** 모든 카테고리 목록 조회 */
  getCategories: () => api.get("/post/categories"),
};

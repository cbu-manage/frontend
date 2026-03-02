/**
 * 보고서 게시글 API
 * @see GET/POST /api/v1/report, /api/v1/report/{postId}...
 */
import { api } from "./client";

// TODO: 세부 타입 추가
export type ReportListParams = { page?: number; size?: number };

export const reportApi = {
  /** 보고서 게시글 미리보기 페이징 조회 */
  getList: (params?: ReportListParams) =>
    api.get("/report", { params }),

  /** 보고서 게시글 생성 */
  create: (data: unknown) => api.post("/report", data),

  /** 보고서 게시글 단건 조회 */
  getById: (postId: number) => api.get(`/report/${postId}`),

  /** 보고서 게시글 수정 */
  update: (postId: number, data: unknown) =>
    api.patch(`/report/${postId}`, data),

  /** 보고서 승인 */
  accept: (postId: number) => api.patch(`/report/${postId}/accept`),
};

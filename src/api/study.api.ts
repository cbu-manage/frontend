/**
 * 스터디 모집 API
 * @see GET/POST /api/v1/post/study, /api/v1/post/study/{postId}...
 */
import { api } from "./client";

// page: 0부터 시작, size: 페이지 당 개수, category: 백엔드 enum 번호
export type StudyListParams = { page?: number; size?: number; category?: number };

export const studyApi = {
  /** 스터디 게시글 전체 목록 페이징 조회 (카테고리별, 최신순) */
  getList: (params?: StudyListParams) =>
    api.get("/post/study", { params }),

  /** 스터디 게시글 생성 */
  create: (data: unknown) => api.post("/post/study", data),

  /** 스터디 게시글 상세 조회 */
  getById: (postId: number) => api.get(`/post/study/${postId}`),

  /** 스터디 게시글 수정 */
  update: (postId: number, data: unknown) =>
    api.patch(`/post/study/${postId}`, data),

  /** 스터디 게시글 삭제 */
  delete: (postId: number) => api.delete(`/post/study/${postId}`),

  /** 스터디 모집 마감 */
  close: (postId: number) => api.post(`/post/study/${postId}/close`),

  /** 스터디 신청 목록 조회 */
  getApplyList: (postId: number) =>
    api.get(`/post/study/${postId}/apply`),

  /** 스터디 참가 신청 */
  apply: (postId: number) => api.post(`/post/study/${postId}/apply`),

  /** 스터디 신청 취소 */
  cancelApply: (postId: number) =>
    api.delete(`/post/study/${postId}/apply`),

  /** 스터디 신청 수락/거절 */
  updateApplyStatus: (postId: number, applyId: number, data: unknown) =>
    api.patch(`/post/study/${postId}/apply/${applyId}`, data),

  /** 내가 작성한 스터디 게시글 목록 조회 */
  getMyList: (params?: StudyListParams) =>
    api.get("/post/study/me", { params }),
};

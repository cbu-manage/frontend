/**
 * 공통 포스트 API
 * - 카테고리별 포스트 목록: /api/v1/post
 * - 포스트 단건 조회: /api/v1/post/{postId}/post
 * - 포스트 삭제: /api/v1/post/{postId}
 */
import { api } from "./client";

/** 카테고리 번호: 1 스터디, 2 프로젝트, 5 코딩테스트, 6 자료방 */
export const POST_CATEGORY = {
  STUDY: 1,
  PROJECT: 2,
  CODING_TEST: 5,
  ARCHIVE: 6,
} as const;

export type PostListParams = {
  /** 카테고리 (1 스터디, 2 프로젝트, 5 코딩테스트, 6 자료방) */
  category: number;
  /** 페이지 (0부터) */
  page: number;
  /** 페이지당 개수 */
  size: number;
};

/** 포스트 목록 아이템 (API 응답 content 요소 - 공통 필드만) */
export type PostListItem = {
  postId: number;
  title: string;
  content?: string;
  category?: number;
  createdAt?: string;
  /** 스터디: studyTags, 프로젝트: recruitmentFields 등 */
  tags?: string[];
  authorName?: string;
  authorGeneration?: number;
  viewCount?: number;
  comments?: number;
  recruiting?: boolean;
  [key: string]: unknown;
};

/** 포스트 목록 응답 (data 필드) */
export type PostListResponse = {
  content: PostListItem[];
  totalPages?: number;
  totalElements?: number;
  number?: number;
  size?: number;
};

export const postApi = {
  /** 카테고리별 포스트 목록 페이징 조회 */
  getList: (params: PostListParams) => api.get("/post", { params }),

  /** 포스트 메인테이블 단건 조회 */
  getById: (postId: number) => api.get(`/post/${postId}/post`),

  /** 포스트 단건 삭제 (보고서 등) */
  delete: (postId: number) => api.delete(`/post/${postId}`),
};

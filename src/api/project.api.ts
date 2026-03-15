/**
 * 프로젝트 모집 API
 * @see GET/POST /api/v1/post/project, /api/v1/post/project/{postId}...
 */
import { api } from "./client";

/** 프로젝트 목록 조회 파라미터 - page 0부터, size 필수, category 2 고정 */
export type ProjectListParams = {
  page: number;
  size: number;
  category: 2;
  /** true: 모집 중만, false: 전체/마감 포함 */
  recruiting?: boolean;
};

export type ProjectFilterParams = { category?: string; page?: number; size?: number };

/** 프로젝트 목록 아이템 (API 응답 content 요소) */
export type ProjectListItem = {
  postId: number;
  title: string;
  content: string;
  recruitmentFields: string[];
  authorId: number;
  authorGeneration: number;
  authorName: string;
  createdAt: string;
  recruiting: boolean;
  deadline?: string;
  viewCount: number;
};

/** 프로젝트 목록 응답 (data 필드) */
export type ProjectListResponse = {
  totalElements: number;
  totalPages: number;
  size: number;
  content: ProjectListItem[];
  number: number;
  numberOfElements: number;
  last: boolean;
  first: boolean;
  empty: boolean;
};

/** 프로젝트 생성 요청 */
export type CreateProjectRequest = {
  title: string;
  content: string;
  recruitmentFields: string[];
  recruiting: boolean;
  deadline: string;
  maxMember: number;
  category: 2;
};

/** 프로젝트 수정 요청 */
export type UpdateProjectRequest = {
  title?: string;
  content?: string;
  recruitmentFields?: string[];
  recruiting?: boolean;
  deadline?: string;
  maxMember?: number;
};

export type ProjectDetailData = {
  postId: number;
  authorId: number;
  title: string;
  content: string;
  recruitmentFields?: string[];
  recruiting: boolean;
  createdAt: string;
  deadline?: string;
  maxMember?: number;
  groupId?: number;
  authorGeneration?: number;
  authorName?: string;
  viewCount?: number;
  /** 작성자(팀장) 여부 - 신청 인원 확인 버튼 노출 */
  leader?: boolean;
  /** 신청 여부 - 신청하기/취소하기/가입완료 분기 */
  hasApplied?: boolean;
  /** @deprecated leader 사용 */
  isLeader?: boolean;
};
export const projectApi = {
  /** 프로젝트 게시글 전체 목록 페이징 조회 */
  getList: (params?: ProjectListParams) =>
    api.get("/post/project", { params }),

  /** 프로젝트 게시글 생성 */
  create: (data: CreateProjectRequest) => api.post("/post/project", data),

  /** 프로젝트 게시글 상세 조회 */
  getById: (postId: number) => api.get(`/post/project/${postId}`),

  /** 프로젝트 게시글 수정 */
  update: (postId: number, data: UpdateProjectRequest) =>
    api.patch(`/post/project/${postId}`, data),

  /** 프로젝트 게시글 삭제 */
  delete: (postId: number) => api.delete(`/post/project/${postId}`),

  /** 프로젝트 모집 마감 */
  close: (postId: number) => api.post(`/post/project/${postId}/close`),

  /** 내가 작성한 프로젝트 게시글 목록 조회 */
  getMyList: (params?: ProjectListParams) =>
    api.get("/post/project/me", { params }),

  /** 프로젝트 모집분야 카테고리별 목록 페이징 조회 */
  getFilteredList: (params?: ProjectFilterParams) =>
    api.get("/post/project/filter", { params }),
};

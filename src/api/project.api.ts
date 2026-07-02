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
  maxMembers: number;
  category: 2;
};

/** 프로젝트 수정 요청 */
export type UpdateProjectRequest = {
  title?: string;
  content?: string;
  recruitmentFields?: string[];
  recruiting?: boolean;
  deadline?: string;
  maxMembers?: number;
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
  maxMembers?: number;
  groupId?: number;
  authorGeneration?: number;
  authorName?: string;
  viewCount?: number;
  /**
   * 작성자(팀장) 여부 - 신청 인원 확인 버튼 노출.
   * ⚠️ 스웨거(ProjectInfoDetailDTO)의 실제 필드는 isLeader — 스터디(leader)와 이름이 다름.
   */
  isLeader?: boolean;
  /** 스터디 상세와의 호환용 별칭 — 서버 응답엔 없음, isLeader를 사용할 것 */
  leader?: boolean;
  /** 신청 여부 - 신청하기/취소하기/가입완료 분기 */
  hasApplied?: boolean;
};
export const projectApi = {
  /** 프로젝트 게시글 전체 목록 페이징 조회 */
  getList: (params?: ProjectListParams) => api.get("/post/project", { params }),

  /** 프로젝트 게시글 생성 */
  create: (data: CreateProjectRequest) => api.post("/post/project", data),

  /** 프로젝트 게시글 상세 조회 */
  getById: (postId: number) => api.get(`/post/project/${postId}`),

  /** 프로젝트 게시글 수정 */
  update: (postId: number, data: UpdateProjectRequest) =>
    api.patch(`/post/project/${postId}`, data),

  /** 프로젝트 게시글 삭제 */
  delete: (postId: number) => api.delete(`/post/project/${postId}`),

  // 모집 마감(close) API 없음 — 스웨거엔 스터디 close만 존재. 프로젝트 마감은 update(recruiting: false) 사용 (구버전 경로 제거, #225)
  // 분야별 필터(/post/project/filter, params: fields·recruiting)는 미사용이라 미구현 — 필요 시 스웨거 기준으로 추가

  /** 내가 작성한 프로젝트 게시글 목록 조회 — /me는 recruiting 파라미터 미지원 */
  getMyList: (params?: Omit<ProjectListParams, "recruiting">) =>
    api.get("/post/project/me", { params }),
};

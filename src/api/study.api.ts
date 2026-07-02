/**
 * 스터디 모집 API
 * @see GET/POST /api/v1/post/study, /api/v1/post/study/{postId}...
 */
import { api } from "./client";

// page: 0부터 시작, size: 페이지 당 개수, category: 백엔드 enum 번호
export type StudyListParams = {
  page?: number;
  size?: number;
  category?: number;
};

/** GET /post/study/me — Swagger상 page, size, category 필수 (스터디 category=1) */
export type StudyMyListParams = {
  page: number;
  size: number;
  category: number;
};

export type CreateStudyRequest = {
  title: string;
  content: string;
  studyTags: string[];
  studyName: string;
  recruiting: boolean;
  maxMembers: number;
  category: number;
};

export type UpdateStudyRequest = Partial<
  Omit<CreateStudyRequest, "category" | "recruiting">
> & {
  // 모집 상태 변경은 close API를 사용하므로 여기선 제외
};

export type StudyDetailResponse = {
  code: string;
  message: string;
  data: {
    postId: number;
    authorId: number;
    title: string;
    content: string;
    studyTags: string[];
    studyName: string;
    recruiting: boolean;
    maxMembers: number;
    createdAt: string;
    category: number;
    groupId?: number;
    authorGeneration?: number;
    authorName?: string;
    viewCount?: number;
    /** 작성자(팀장) 여부 - 신청 인원 확인 버튼 노출 */
    leader?: boolean;
    /** 신청 여부 - 신청하기/취소하기/가입완료 분기 */
    hasApplied?: boolean;
    /** @deprecated leader 사용 */
    isAuthor?: boolean;
  };
};

export const studyApi = {
  /** 스터디 게시글 전체 목록 페이징 조회 (카테고리별, 최신순) */
  getList: (params?: StudyListParams) => api.get("/post/study", { params }),

  /** 스터디 게시글 생성 */
  create: (data: CreateStudyRequest) => api.post("/post/study", data),

  /** 스터디 게시글 상세 조회 */
  getById: (postId: number) =>
    api.get<StudyDetailResponse>("/post/study/" + postId),

  /** 스터디 게시글 수정 */
  update: (postId: number, data: UpdateStudyRequest) =>
    api.patch(`/post/study/${postId}`, data),

  /** 스터디 게시글 삭제 */
  delete: (postId: number) => api.delete(`/post/study/${postId}`),

  /** 스터디 모집 마감 */
  close: (postId: number) => api.post(`/post/study/${postId}/close`),

  // 신청(apply) 관련 API 없음 — 스터디 참가 신청/수락은 groups API 경유 (구버전 /apply 경로는 서버에 존재하지 않아 제거, #225)

  /** 내가 작성한 스터디 게시글 목록 조회 (authorName·authorGeneration 등 content 스키마) */
  getMyList: (params: StudyMyListParams) =>
    api.get("/post/study/me", { params }),

  /** 태그별 목록 조회 */
  filterByTag: (params: { page?: number; size?: number; tag: string }) =>
    api.get("/post/study/filter", { params }),
};

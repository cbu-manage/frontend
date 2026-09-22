import { api } from "./client";
import { type ApiEnvelope } from "./auth.api";

/** 스프링 Page 응답 중 화면에서 쓰는 필드만 */
export type FlagPage<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
};

export type FlagListParams = {
  /** 0부터 시작 */
  page: number;
  size: number;
};

/** 게시글 신고 목록 행 */
export type FlagPostPreview = {
  flagPostId: number;
  /** 신고 사유 */
  content: string;
  createdAt: string;
  targetPostId: number;
  targetPostTitle: string;
  /** PostCategory value(1 스터디·2 프로젝트·5 코테·6 자료방·7 보고서·8 자게·11 소식). 구 서버는 미제공 */
  targetPostCategory?: number;
  authorId: number;
  authorName: string;
  authorGeneration?: number;
};

/** 게시글 신고 상세 — 대상 글 본문·작성자 포함. 익명 글이어도 작성자는 실명으로 온다 */
export type FlagPostInfo = FlagPostPreview & {
  targetPostContent: string;
  targetUserId: number;
  targetUserName: string;
  targetUserGeneration?: number;
};

/** 댓글 신고 목록 행 */
export type FlagCommentPreview = {
  flagCommentId: number;
  content: string;
  createdAt: string;
  targetCommentId: number;
  targetCommentContent: string;
  authorId: number;
  authorName: string;
  authorGeneration?: number;
};

export type FlagCommentInfo = FlagCommentPreview & {
  targetUserId: number;
  targetUserName: string;
  targetUserGeneration?: number;
};

/**
 * 신고 관리(운영진용). 허용 역할: ADMIN·회장·부회장 — 서버 @PreAuthorize.
 * 신고 "작성"은 freeboardApi.flag / commentApi.flag 에 있음.
 */
export const flagApi = {
  /** 게시글 신고 목록 (createdAt desc) */
  getPostFlags: (params: FlagListParams) =>
    api.get<ApiEnvelope<FlagPage<FlagPostPreview>>>("/flag/post", { params }),

  /** 게시글 신고 상세 */
  getPostFlag: (flagPostId: number) =>
    api.get<ApiEnvelope<FlagPostInfo>>(`/flag/post/${flagPostId}`),

  /** 대상 게시글에 걸린 미처리 신고를 전부 처리 완료로 (신고 id 가 아니라 게시글 id) */
  resolvePostFlags: (postId: number) =>
    api.patch<ApiEnvelope<null>>(`/flag/post/${postId}/resolve`),

  /** 댓글 신고 목록 (createdAt desc) */
  getCommentFlags: (params: FlagListParams) =>
    api.get<ApiEnvelope<FlagPage<FlagCommentPreview>>>("/flag/comment", {
      params,
    }),

  /** 댓글 신고 상세 */
  getCommentFlag: (flagCommentId: number) =>
    api.get<ApiEnvelope<FlagCommentInfo>>(`/flag/comment/${flagCommentId}`),

  /** 대상 댓글에 걸린 미처리 신고를 전부 처리 완료로 (댓글 id) */
  resolveCommentFlags: (commentId: number) =>
    api.patch<ApiEnvelope<null>>(`/flag/comment/${commentId}/resolve`),
};

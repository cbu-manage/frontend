import { api } from "./client";
import { type ApiEnvelope } from "./auth.api";

export type FreeBoardCreateBody = {
  title: string;
  content: string;
  isAnonymous: boolean;
};

export type FreeBoardUpdateBody = Partial<FreeBoardCreateBody>;

export type FreeBoardListItem = {
  postId: number;
  title: string;
  /** 실명 글에만 존재 (익명 글은 작성자 필드 자체가 없음) */
  authorName?: string;
  /** 작성자 기수 — authorName과 따로 내려옴 (2026-07-02 명세: authorGeneration) */
  authorGeneration?: number;
  authorId?: string | number;
  isAnonymous?: boolean;
  category?: string;
  viewCount?: number;
  commentCount?: number;
  createdAt?: string;
  [key: string]: unknown;
};

/** 작성자 표기 — 익명이면 "익명", 아니면 "{authorGeneration}기 {authorName}" */
export function freeboardAuthorLabel(p: {
  isAnonymous?: boolean;
  authorName?: string;
  authorGeneration?: number;
}): string {
  if (p.isAnonymous || !p.authorName) return "익명";
  return p.authorGeneration != null
    ? `${p.authorGeneration}기 ${p.authorName}`
    : p.authorName;
}

export type FreeBoardListResponse = {
  content: FreeBoardListItem[];
  totalPages?: number;
  totalElements?: number;
  number?: number;
  size?: number;
};

export type FreeBoardPost = FreeBoardListItem & {
  content?: string;
  isAuthor?: boolean;
};

export const freeboardApi = {
  /** 자유게시판 목록 페이징 조회 */
  getList: (params: { page: number; size: number }) =>
    api.get<ApiEnvelope<FreeBoardListResponse>>("/freeboard", { params }),

  /** 자유게시판 게시글 단건 조회 */
  getById: (postId: number) =>
    api.get<ApiEnvelope<FreeBoardPost>>(`/freeboard/${postId}`),

  /** 자유게시판 게시글 작성 */
  create: (data: FreeBoardCreateBody) =>
    api.post<ApiEnvelope<null>>("/freeboard", data),

  /** 자유게시판 게시글 수정 */
  update: (postId: number, data: FreeBoardUpdateBody) =>
    api.patch<ApiEnvelope<null>>(`/freeboard/${postId}`, data),

  /** 게시글 신고 */
  flag: (postId: number, content: string) =>
    api.post<ApiEnvelope<null>>(`/post/${postId}/flag`, { content }),

  /**
   * 자게 댓글 목록 — 단일 엔드포인트, 댓글별 isAnonymous로 스키마 분기
   * (익명 댓글엔 userId/userName/generation 없음)
   */
  getComments: (postId: number) =>
    api.get<{ data?: unknown }>(`/freeboard/${postId}/comment`),

  /**
   * 자게 댓글 작성 — 익명 여부는 쿼리 파라미터.
   * 게시글 자체가 익명이면 isAnonymous 값과 무관하게 무조건 익명 처리(서버).
   */
  createComment: (postId: number, content: string, isAnonymous: boolean) =>
    api.post(
      `/freeboard/${postId}/comment`,
      { content },
      {
        params: { isAnonymous },
      },
    ),
};

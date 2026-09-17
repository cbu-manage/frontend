import { api } from "./client";
import { type ApiEnvelope } from "./auth.api";

export type SuggestionType = "BUG" | "SUGGESTION";
export type SuggestionStatus = "OPEN" | "RESOLVED";

export type SuggestionListParams = {
  /** 0부터 */
  page: number;
  size: number;
  type?: SuggestionType;
  status?: SuggestionStatus;
};

/** 목록 행 — 작성자 정보 없음(전부 익명), 본인 여부는 서버가 준 isAuthor */
export type SuggestionListItem = {
  postId: number;
  title: string;
  type: SuggestionType;
  status: SuggestionStatus;
  /** 상단 고정 — 목록은 고정 글이 먼저 온다. 구 서버는 미제공 */
  isPinned?: boolean;
  createdAt: string;
  viewCount?: number;
  commentCount?: number;
  isAuthor: boolean;
};

export type SuggestionPost = SuggestionListItem & {
  content: string;
  resolvedAt?: string | null;
};

export type SuggestionPage = {
  content: SuggestionListItem[];
  totalPages?: number;
  totalElements?: number;
  number?: number;
  size?: number;
};

export type SuggestionSummary = { openCount: number; resolvedCount: number };

export type SuggestionCreateBody = {
  title: string;
  content: string;
  type: SuggestionType;
};
export type SuggestionUpdateBody = Partial<SuggestionCreateBody>;

/** 댓글·답글 — 작성자 정보 없음. parentCommentId 로 1단계 트리 */
export type SuggestionComment = {
  commentId: number;
  content: string;
  parentCommentId: number | null;
  createdAt: string;
  isDeleted: boolean;
  isAuthor: boolean;
};

/**
 * 건의 게시판(대나무숲). 전 엔드포인트 로그인 필수.
 * 글·댓글 모두 서버가 익명을 강제하므로 isAnonymous 를 보내는 필드가 없다.
 */
export const suggestionApi = {
  getList: (params: SuggestionListParams) =>
    api.get<ApiEnvelope<SuggestionPage>>("/suggestion", { params }),

  getSummary: () =>
    api.get<ApiEnvelope<SuggestionSummary>>("/suggestion/summary"),

  getById: (postId: number) =>
    api.get<ApiEnvelope<SuggestionPost>>(`/suggestion/${postId}`),

  create: (data: SuggestionCreateBody) =>
    api.post<ApiEnvelope<SuggestionPost>>("/suggestion", data),

  update: (postId: number, data: SuggestionUpdateBody) =>
    api.patch<ApiEnvelope<null>>(`/suggestion/${postId}`, data),

  /** 운영진 전용 — 해결/미해결 전환 */
  updateStatus: (postId: number, status: SuggestionStatus) =>
    api.patch<ApiEnvelope<null>>(`/suggestion/${postId}/status`, { status }),

  /** ADMIN(루트) 전용 — 상단 고정/해제 */
  updatePinned: (postId: number, pinned: boolean) =>
    api.patch<ApiEnvelope<null>>(`/suggestion/${postId}/pin`, { pinned }),

  /** 작성자 또는 관리자. 소프트 삭제 */
  delete: (postId: number) =>
    api.delete<ApiEnvelope<null>>(`/suggestion/${postId}`),

  /** 게시글 신고 — 공용 신고 API. 익명 글이어도 운영진은 신고 상세에서 작성자를 본다 */
  flag: (postId: number, content: string) =>
    api.post<ApiEnvelope<null>>(`/post/${postId}/flag`, { content }),

  getComments: (postId: number) =>
    api.get<ApiEnvelope<SuggestionComment[]>>(`/suggestion/${postId}/comment`),

  /** 댓글(parentCommentId 없음) 또는 답글(있음). 항상 익명 */
  createComment: (
    postId: number,
    data: { content: string; parentCommentId?: number },
  ) =>
    api.post<ApiEnvelope<{ commentId: number }>>(
      `/suggestion/${postId}/comment`,
      data,
    ),
};

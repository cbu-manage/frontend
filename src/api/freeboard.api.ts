import { api } from "./client";

export type FreeBoardCreateBody = {
  title: string;
  content: string;
  isAnonymous: boolean;
};

export type FreeBoardUpdateBody = Partial<FreeBoardCreateBody>;

export type FreeBoardListItem = {
  postId: number;
  title: string;
  authorName?: string;
  authorId?: string | number;
  isAnonymous?: boolean;
  viewCount?: number;
  commentCount?: number;
  createdAt?: string;
  [key: string]: unknown;
};

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
    api.get("/freeboard", { params }),

  /** 자유게시판 게시글 단건 조회 */
  getById: (postId: number) =>
    api.get(`/freeboard/${postId}`),

  /** 자유게시판 게시글 작성 */
  create: (data: FreeBoardCreateBody) =>
    api.post("/freeboard", data),

  /** 자유게시판 게시글 수정 */
  update: (postId: number, data: FreeBoardUpdateBody) =>
    api.patch(`/freeboard/${postId}`, data),

  /** 게시글 신고 */
  flag: (postId: number) =>
    api.post(`/post/${postId}/flag`),
};

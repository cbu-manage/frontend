import { api } from "./client";

export type ResourceListParams = {
  /** 페이지 번호 (0부터 시작, 기본 0) */
  page?: number;
  /** 페이지당 개수 (기본 20) */
  size?: number;
  /** 정렬 (기본: post.createdAt,DESC) */
  sort?: string[];
};

export type ResourceItem = {
  resourceId: number;
  title: string;
  link: string;
  /** 썸네일 이미지 URL (og:image 등, 백엔드에서 채우면 표시) */
  thumbnailUrl?: string;
  authorName?: string;
  generation?: number;
  createdAt?: string;
  [key: string]: unknown;
};

export type ResourceListResponse = {
  content: ResourceItem[];
  totalPages: number;
};

export const resourcesApi = {
  /** 자료 목록 조회 (최신순) */
  getList: (params?: ResourceListParams) =>
    api.get<ResourceListResponse | ResourceItem[]>("/resources", {
      params: { sort: ["post.createdAt,DESC"], ...params },
    }),

  /** 내 자료 목록 조회 (최신순) */
  getMyList: (params?: ResourceListParams) =>
    api.get<ResourceListResponse | ResourceItem[]>("/resources/my", {
      params: { sort: ["post.createdAt,DESC"], ...params },
    }),

  /** 자료 등록 (제목, 링크 필수) */
  create: (data: { title: string; link: string }) =>
    api.post("/resources", data),

  /** 자료 삭제 (작성자 본인만) */
  delete: (id: number) => api.delete(`/resources/${id}`),
};


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
  authorName?: string;
  generation?: number;
  createdAt?: string;
  /** OG 파싱 결과 (og:image) */
  ogImage?: string;
  /** OG 파싱 결과 (og:description) */
  ogDescription?: string;
  [key: string]: unknown;
};

export type OgPreviewResponse = {
  ogTitle: string | null;
  ogImage: string | null;
  ogDescription: string | null;
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

  /** 자료 등록 (링크 필수, 제목 생략 시 OG 파싱으로 자동 설정) */
  create: (data: { title?: string; link: string }) =>
    api.post("/resources", data),

  /** OG 데이터 미리보기 (URL에서 og:title, og:image, og:description 추출) */
  getOgPreview: (url: string) =>
    api.get<{ data: OgPreviewResponse }>("/resources/og-preview", {
      params: { url },
    }),

  /** 자료 삭제 (작성자 본인만) */
  delete: (id: number) => api.delete(`/resources/${id}`),
};


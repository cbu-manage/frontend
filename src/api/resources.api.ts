import { api } from "./client";

export type ResourceListParams = {
  page?: number;
  size?: number;
};

export type ResourceItem = {
  id: number;
  title: string;
  link: string;
  createdAt?: string;
  createdBy?: string;
  [key: string]: unknown;
};

export type ResourceListResponse = {
  content: ResourceItem[];
  totalPages: number;
};

export const resourcesApi = {
  /** 자료 목록 조회 (페이징) */
  getList: (params?: ResourceListParams) =>
    api.get<ResourceListResponse | ResourceItem[]>("/resources", { params }),

  /** 자료 등록 */
  create: (data: { title: string; link: string }) =>
    api.post("/resources", data),

  /** 자료 삭제 (작성자 본인만) */
  delete: (id: number) => api.delete(`/resources/${id}`),
};


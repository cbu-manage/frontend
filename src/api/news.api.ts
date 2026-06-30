import { api } from "./client";
import { type ApiEnvelope } from "./auth.api";

export type NewsCategory = "NOTICE" | "EVENT" | "NEWSLETTER" | "IT_NEWS";

export type NewsListParams = {
  category?: NewsCategory;
  keyword?: string;
  page?: number;
  size?: number;
  sort?: string[];
};

export type NewsListItem = {
  newsId: number;
  postId: number;
  authorId: number;
  title: string;
  category: NewsCategory;
  createdAt: string;
  viewCount: number;
  pinned: boolean;
};

export type PageInfo = {
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export type NewsSearchInfo = {
  keyword: string | null;
  mode: "NONE" | "AND" | "OR_FALLBACK";
  fallbackApplied: boolean;
};

export type NewsListResponse = {
  content: NewsListItem[];
  page: PageInfo;
  search: NewsSearchInfo;
};

export type NewsAttachment = {
  attachmentId: number;
  fileName: string;
  contentType: string;
  fileSize: number;
};

export type NewsDetail = {
  newsId: number;
  postId: number;
  authorId: number;
  title: string;
  category: NewsCategory;
  content: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  pinned: boolean;
  attachments: NewsAttachment[];
};

export type NewsCreateBody = {
  title: string;
  content: string;
  category?: NewsCategory;
};

export type NewsUpdateBody = {
  title?: string;
  content?: string;
  category?: NewsCategory;
};

export type AttachmentDownload = {
  url: string;
  fileName: string;
};

export const newsApi = {
  getList: (params: NewsListParams) =>
    api.get<ApiEnvelope<NewsListResponse>>("/news", { params }),

  getById: (id: number) =>
    api.get<ApiEnvelope<NewsDetail>>(`/news/${id}`),

  create: (data: NewsCreateBody) =>
    api.post<ApiEnvelope<NewsDetail>>("/news", data),

  update: (id: number, data: NewsUpdateBody) =>
    api.patch<ApiEnvelope<NewsDetail>>(`/news/${id}`, data),

  delete: (id: number) =>
    api.delete<ApiEnvelope<void>>(`/news/${id}`),

  pin: (id: number, pinned: boolean) =>
    api.patch<ApiEnvelope<NewsDetail>>(`/news/${id}/pin`, { pinned }),

  addAttachment: (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<ApiEnvelope<NewsAttachment>>(
      `/news/${id}/attachments`,
      formData,
    );
  },

  deleteAttachment: (id: number, attachmentId: number) =>
    api.delete<ApiEnvelope<void>>(`/news/${id}/attachments/${attachmentId}`),

  downloadAttachment: (id: number, attachmentId: number) =>
    api.get<ApiEnvelope<AttachmentDownload>>(
      `/news/${id}/attachments/${attachmentId}/download`,
    ),
};

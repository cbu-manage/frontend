import { api } from "./client";
import { type ApiEnvelope } from "./auth.api";

export type NewsCategory = "NOTICE" | "EVENT" | "NEWSLETTER" | "IT_NEWS";

export type NewsletterType = "WEEKLY" | "SPECIAL" | "NOTICE";

// TODO(백엔드): GET /api/v1/news에 newsletterType 쿼리 파라미터(복수 지원) 추가 요청됨.
// 추가되면 NewsListParams에 newsletterType?: NewsletterType | NewsletterType[] 필드 추가하고
// getList 호출부(useNewsList, news/page.tsx)에서 서버 필터링으로 전환할 것.
export type NewsListParams = {
  category?: NewsCategory | NewsCategory[];
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
  newsletterType?: NewsletterType;
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
  newsletterType?: NewsletterType;
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
  newsletterType?: NewsletterType;
};

export type NewsUpdateBody = {
  title?: string;
  content?: string;
  category?: NewsCategory;
  newsletterType?: NewsletterType;
};

export type AttachmentDownload = {
  url: string;
  fileName: string;
};

export const newsApi = {
  getList: (params: NewsListParams) =>
    api.get<ApiEnvelope<NewsListResponse>>("/news", {
      params,
      paramsSerializer: { indexes: null },
    }),

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

/**
 * 보고서 게시글 API
 * @see GET/POST /api/v1/report, /api/v1/report/{postId}...
 */
import { api } from "./client";

export type ReportListParams = {
  page?: number;
  size?: number;
  /** 활동일 기준 서버 필터 (yyyy-MM-dd) */
  startDate?: string;
  endDate?: string;
  /** 검색어 (제목·작성자명) */
  keyword?: string;
};

/** GET /report, /report/group/{groupId} 응답의 보고서 미리보기 한 건 */
export type ReportPreviewItem = {
  postId: number;
  title: string;
  createdAt: string;
  /** 활동 일자 (목록 카드·정렬용) — createdAt(생성일)과 다름 */
  date: string;
  authorId: number;
  authorName: string;
  /** 작성자 기수 */
  generation: number;
  isAccepted: boolean;
  groupId: number;
  groupName: string;
  groupMemberCount: number;
};

/** 페이징 응답 공통 형태 (페이징 메타는 page 객체에 중첩됨) */
export type ReportPreviewPage = {
  content: ReportPreviewItem[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
};

/** 목록 조회 응답 — reports(페이징) + search(검색 메타) 로 감싸짐 */
export type ReportListResponse = {
  reports: ReportPreviewPage;
  search: {
    keyword: string | null;
    mode: string;
  };
};

/** 보고서 참여자 한 명 */
export type ReportMember = {
  userId: number;
  name: string;
  studentNumber: number;
  major: string;
};

/** GET /report/{postId} 단건 조회 응답 */
export type ReportDetail = {
  postInfoDTO: {
    postId: number;
    authorName: string;
    generation: number;
    authorId: number;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
  };
  reportInfoDTO: {
    location: string;
    reportImage: string;
    reportFile: string;
    date: string;
    groupInfoDTO: {
      groupId: number;
      groupName: string;
    };
    isAccepted: boolean;
    reflection: string;
    nextPlan: string;
    reportMembers: ReportMember[];
  };
};

type ApiResponse<T> = { code: string; message: string; data: T };

export const reportApi = {
  /** 보고서 게시글 미리보기 페이징 조회 */
  getList: (params?: ReportListParams) =>
    api.get<ApiResponse<ReportListResponse>>("/report", { params }),

  /** 보고서 게시글 생성 */
  create: (data: unknown) => api.post("/report", data),

  /** 이미지 업로드 (S3) — 응답 data가 업로드된 이미지 URL 문자열 */
  uploadImage: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post<ApiResponse<string>>("/file/image", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /** 보고서 게시글 단건 조회 */
  getById: (postId: number) =>
    api.get<ApiResponse<ReportDetail>>(`/report/${postId}`),

  /** 보고서 게시글 수정 */
  update: (postId: number, data: unknown) =>
    api.patch(`/report/${postId}`, data),

  /** 보고서 게시글 삭제 — 보고서 전용 DELETE가 없어 공용 게시글 삭제 사용 */
  remove: (postId: number) => api.delete(`/post/${postId}`),

  /** 그룹별 보고서 게시글 미리보기 페이징 조회 */
  getGroupList: (groupId: number, params?: ReportListParams) =>
    api.get<ApiResponse<ReportListResponse>>(`/report/group/${groupId}`, {
      params,
    }),

  /** 보고서 HWP 파일 추출 (관리자 전용, blob 다운로드) */
  exportHwp: (postId: number) =>
    api.get(`/report/${postId}/export`, { responseType: "blob" }),

  /** 그룹 보고서 전체 ZIP 추출 (관리자 전용, blob 다운로드) */
  exportGroupZip: (groupId: number) =>
    api.get(`/report/export/group/${groupId}`, { responseType: "blob" }),
};

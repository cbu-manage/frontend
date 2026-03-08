/**
 * 코딩테스트 문제 API
 * @see GET/POST /api/v1/post/problems, /api/v1/post/platforms, /api/v1/post/languages, /api/v1/post/categories
 */
import { api } from "./client";

// ========== 메타 (필터/폼용) ==========

export type PlatformItem = { id: number; name?: string; [key: string]: unknown };
export type LanguageItem = { id: number; name?: string; [key: string]: unknown };
export type CategoryItem = { id: number; name?: string; [key: string]: unknown };

// ========== 목록 ==========

export type ProblemListParams = {
  /** 페이지 (0부터) */
  page?: number;
  /** 페이지당 개수 (default 10) */
  size?: number;
  /** 정렬 (default: post.createdAt,DESC) */
  sort?: string[];
  /** 카테고리 ID 복수 선택 */
  categoryId?: number[];
  /** 플랫폼 ID 복수 선택 */
  platformId?: number[];
};

export type ProblemListItem = {
  /** 포스트 ID (상세 조회 path에 사용 가능) */
  postId?: number;
  /** 문제 ID (postId 대신 반환될 수 있음) */
  id?: number;
  title: string;
  content?: string;
  problemStatus?: "SOLVED" | "UNSOLVED";
  problemUrl?: string;
  grade?: string;
  platformId?: number;
  languageId?: number;
  categoryIds?: number[];
  authorName?: string;
  authorGeneration?: number;
  viewCount?: number;
  createdAt?: string;
  [key: string]: unknown;
};

export type ProblemListResponse = {
  content: ProblemListItem[];
  totalPages?: number;
  totalElements?: number;
  number?: number;
  size?: number;
};

// ========== 생성/수정 ==========

export type CreateProblemRequest = {
  categoryIds: number[];
  platformId: number;
  languageId: number;
  title: string;
  content: string;
  grade: string;
  problemUrl: string;
  problemStatus: "SOLVED" | "UNSOLVED";
};

export type UpdateProblemRequest = Partial<CreateProblemRequest>;

export const codingTestApi = {
  /** 코딩테스트 문제 목록 조회 (페이지네이션, 카테고리/플랫폼 필터) */
  getList: (params?: ProblemListParams) =>
    api.get("/post/problems", { params }),

  /** 새 코딩테스트 문제 생성 */
  create: (data: CreateProblemRequest) => api.post("/post/problems", data),

  /** 문제 상세 정보 조회 (조회수 증가). path param은 postId 또는 id 모두 사용 가능 */
  getById: (idOrPostId: number) => api.get(`/post/problems/${idOrPostId}`),

  /** 문제 정보 수정 (postId 또는 id) */
  update: (idOrPostId: number, data: UpdateProblemRequest) =>
    api.patch(`/post/problems/${idOrPostId}`, data),

  /** 문제 삭제 (postId 또는 id) */
  delete: (idOrPostId: number) => api.delete(`/post/problems/${idOrPostId}`),

  /** 모든 플랫폼 목록 조회 */
  getPlatforms: () => api.get<{ data?: PlatformItem[] }>("/post/platforms"),

  /** 모든 언어 목록 조회 */
  getLanguages: () => api.get<{ data?: LanguageItem[] }>("/post/languages"),

  /** 모든 카테고리 목록 조회 */
  getCategories: () => api.get<{ data?: CategoryItem[] }>("/post/categories"),
};

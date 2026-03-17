"use client";

import { useState, useMemo } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { MessageCircle, Eye, Trash2, Clock, UserCircle } from "lucide-react";
import Link from "next/link";
import PGN from "@/components/shared/Pagination";
import { StudyCard } from "@/components/study/StudyCard";
import { ProjectCard } from "@/components/project/ProjectCard";
import { CodingTestRow } from "@/components/coding-test/CodingTestRow";
import ArchiveCard from "@/components/archive/card";
import { postApi, POST_CATEGORY, resourcesApi, projectApi } from "@/api";
import { useDeleteResource } from "@/hooks/archive/useResourceList";
import type { PostListItem, ResourceItem } from "@/api";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// ============================================
// 타입 정의
// ============================================

/** 카테고리 필터 키 */
type PostCategory =
  | "전체보기"
  | "스터디 모집"
  | "프로젝트 모집"
  | "코딩테스트 준비"
  | "자료방";

type PostStatus = "모집 중" | "모집 완료";

interface MyPost {
  id: number;
  category: Exclude<PostCategory, "전체보기">;
  status: PostStatus;
  title: string;
  content: string;
  tags: string[];
  author?: string;
  views: number;
  comments: number;
  time: string;
  href: string;
  createdAt?: string;
}

const CATEGORY_LIST: Exclude<PostCategory, "전체보기">[] = [
  "스터디 모집",
  "프로젝트 모집",
  "코딩테스트 준비",
  "자료방",
];

/** API 카테고리 번호 → 탭 라벨 */
const CATEGORY_NUM_TO_LABEL: Record<
  number,
  Exclude<PostCategory, "전체보기">
> = {
  [POST_CATEGORY.STUDY]: "스터디 모집",
  [POST_CATEGORY.PROJECT]: "프로젝트 모집",
  [POST_CATEGORY.CODING_TEST]: "코딩테스트 준비",
  [POST_CATEGORY.ARCHIVE]: "자료방",
};

/** API 카테고리 번호 → 상세 경로 prefix */
const CATEGORY_NUM_TO_PATH: Record<number, string> = {
  [POST_CATEGORY.STUDY]: "/study",
  [POST_CATEGORY.PROJECT]: "/project",
  [POST_CATEGORY.CODING_TEST]: "/coding-test",
  [POST_CATEGORY.ARCHIVE]: "/archive",
};

const TAB_PAGE_SIZE: Record<PostCategory, number> = {
  전체보기: 12,
  "스터디 모집": 12,
  "프로젝트 모집": 10,
  "코딩테스트 준비": 10,
  자료방: 12,
};

function formatTime(iso?: string): string {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    if (days === 0) return "오늘";
    if (days === 1) return "어제";
    if (days < 7) return `${days}일 전`;
    return d.toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" });
  } catch {
    return iso;
  }
}

/** 마감일 포맷 (프로젝트용 - 프로젝트 모집 게시판과 동일) */
function formatDeadline(iso?: string): string {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
}

/** API content 배열 추출 (post/project/resource 등 다양한 응답 구조 지원) */
function extractContent(raw: unknown): PostListItem[] {
  if (!raw || typeof raw !== "object") return [];
  const obj = raw as Record<string, unknown>;
  let data: unknown = obj.data ?? obj;
  if (Array.isArray(data)) return data as PostListItem[];
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (Array.isArray(d.content)) return d.content as PostListItem[];
    if ("data" in d && d.data && typeof d.data === "object") {
      const inner = d.data as Record<string, unknown>;
      if (Array.isArray(inner.content)) return inner.content as PostListItem[];
    }
  }
  return [];
}

/** API totalPages 추출 */
function extractTotalPages(raw: unknown): number {
  if (!raw || typeof raw !== "object") return 1;
  const obj = raw as Record<string, unknown>;
  const data = obj.data ?? obj;
  if (data && typeof data === "object" && "totalPages" in data) {
    const n = (data as { totalPages?: number }).totalPages;
    return typeof n === "number" && n > 0 ? n : 1;
  }
  return 1;
}

function toMyPost(item: PostListItem, categoryNum: number): MyPost {
  const category = CATEGORY_NUM_TO_LABEL[categoryNum] ?? "스터디 모집";
  const path = CATEGORY_NUM_TO_PATH[categoryNum] ?? "/study";
  const tags = (item.studyTags ??
    item.recruitmentFields ??
    item.tags ??
    []) as string[];
  const author =
    item.authorName != null
      ? item.authorGeneration != null
        ? `${item.authorGeneration}기 ${item.authorName}`
        : item.authorName
      : undefined;
  const postId =
    (item as { problemId?: number }).problemId ??
    item.postId ??
    (item as { id?: number }).id ??
    0;
  const isProject = categoryNum === POST_CATEGORY.PROJECT;
  const deadline = (item as { deadline?: string }).deadline;
  return {
    id: postId,
    category,
    status: (item.recruiting === false ? "모집 완료" : "모집 중") as PostStatus,
    title: item.title ?? "",
    content: (item.content as string) ?? "",
    tags,
    author,
    views: item.viewCount ?? 0,
    comments: item.comments ?? 0,
    time: isProject ? formatDeadline(deadline) : formatTime(item.createdAt as string),
    href: `${path}/${postId}`,
    createdAt: item.createdAt as string | undefined,
  };
}

/** 알려진 프로그래밍 언어 목록 (코딩테스트 매핑용) */
const KNOWN_LANGUAGES = ["Python", "Java", "C++", "JavaScript", "C"];

// ============================================
// MyPostsSection 컴포넌트
// ============================================

/** 탭 → API category 파라미터 */
const TAB_TO_CATEGORY: Record<PostCategory, number | undefined> = {
  전체보기: undefined,
  "스터디 모집": POST_CATEGORY.STUDY,
  "프로젝트 모집": POST_CATEGORY.PROJECT,
  "코딩테스트 준비": POST_CATEGORY.CODING_TEST,
  자료방: POST_CATEGORY.ARCHIVE,
};

const TAB_KEYS: PostCategory[] = ["전체보기", ...CATEGORY_LIST];

/** API 응답 바디에서 totalElements 추출 (post API) */
function extractTotalElements(raw: unknown): number {
  if (!raw || typeof raw !== "object") return 0;
  const obj = raw as Record<string, unknown>;
  const inner =
    "data" in obj && obj.data && typeof obj.data === "object"
      ? (obj.data as { totalElements?: number })
      : (obj as { totalElements?: number });
  return inner?.totalElements ?? 0;
}

/** resources API 응답에서 totalElements 또는 content 길이 추출 */
function extractResourcesTotal(raw: unknown): number {
  if (!raw || typeof raw !== "object") return 0;
  const obj = raw as Record<string, unknown>;
  const inner =
    "data" in obj && obj.data && typeof obj.data === "object"
      ? (obj.data as { totalElements?: number; content?: unknown[] })
      : (obj as { totalElements?: number; content?: unknown[] });
  if (typeof inner?.totalElements === "number") return inner.totalElements;
  if (Array.isArray(inner?.content)) return inner.content.length;
  if (Array.isArray(raw)) return (raw as unknown[]).length;
  return 0;
}

export default function MyPostsSection() {
  const [activeTab, setActiveTab] = useState<PostCategory>("전체보기");
  const [currentPage, setCurrentPage] = useState(1);
  const pageIndex = Math.max(0, currentPage - 1);
  const deleteResourceMutation = useDeleteResource();

  const categoryParam = TAB_TO_CATEGORY[activeTab];
  const pageSize = TAB_PAGE_SIZE[activeTab];

  const COUNT_TABS = ["스터디 모집", "프로젝트 모집", "코딩테스트 준비", "자료방"] as const;

  /** 각 탭 개수 조회 (프로젝트=projectApi, 자료방=resourcesApi, 나머지=postApi) */
  const countResults = useQueries({
    queries: COUNT_TABS.map((tab) => ({
      queryKey:
        tab === "자료방"
          ? ["resources", "my", "count"]
          : tab === "프로젝트 모집"
            ? ["project", "my", "count"]
            : ["post", "my", "count", TAB_TO_CATEGORY[tab]],
      queryFn: () =>
        tab === "자료방"
          ? resourcesApi.getMyList({ page: 0, size: 1 })
          : tab === "프로젝트 모집"
            ? projectApi.getMyList({
                page: 0,
                size: 1,
                category: 2,
              })
            : postApi.getMyPosts({
                category: TAB_TO_CATEGORY[tab],
                page: 0,
                size: 1,
              }),
    })),
  });

  const isCountsLoading = countResults.some((r) => r.isPending);
  const countByTab = useMemo(() => {
    const map: Partial<Record<PostCategory, number>> = {};
    COUNT_TABS.forEach((tab, i) => {
      const res = countResults[i]?.data;
      const apiBody =
        res && typeof res === "object" && "data" in res
          ? (res as { data?: unknown }).data
          : res;
      map[tab] =
        tab === "자료방"
          ? extractResourcesTotal(apiBody ?? res)
          : extractTotalElements(apiBody ?? res);
    });
    map["전체보기"] =
      (map["스터디 모집"] ?? 0) +
      (map["프로젝트 모집"] ?? 0) +
      (map["코딩테스트 준비"] ?? 0) +
      (map["자료방"] ?? 0);
    return map;
  }, [countResults]);

  const isArchiveTab = activeTab === "자료방";
  const isAllTab = activeTab === "전체보기";

  const allTabFetchSize = 50;

  /** 전체보기: 4개 소스 병합 조회 (전부 가져와서 클라이언트 페이지네이션) */
  const allTabQueries = useQueries({
    queries: [
      {
        queryKey: ["post", "my", POST_CATEGORY.STUDY, 0, allTabFetchSize],
        queryFn: async () => {
          const res = await postApi.getMyPosts({
            category: POST_CATEGORY.STUDY,
            page: 0,
            size: allTabFetchSize,
          });
          return res.data;
        },
        enabled: isAllTab,
      },
      {
        queryKey: ["project", "my", 0, allTabFetchSize],
        queryFn: async () => {
          const res = await projectApi.getMyList({
            page: 0,
            size: allTabFetchSize,
            category: 2,
          });
          return res.data;
        },
        enabled: isAllTab,
      },
      {
        queryKey: ["post", "my", POST_CATEGORY.CODING_TEST, 0, allTabFetchSize],
        queryFn: async () => {
          const res = await postApi.getMyPosts({
            category: POST_CATEGORY.CODING_TEST,
            page: 0,
            size: allTabFetchSize,
          });
          return res.data;
        },
        enabled: isAllTab,
      },
      {
        queryKey: ["resources", "my", 0, allTabFetchSize],
        queryFn: async () => {
          const res = await resourcesApi.getMyList({
            page: 0,
            size: allTabFetchSize,
          });
          const payload =
            res.data && typeof res.data === "object" && "data" in res.data
              ? (res.data as { data?: unknown }).data
              : res.data;
          if (Array.isArray(payload))
            return { content: payload, totalPages: 1, totalElements: payload.length };
          const obj = payload as {
            content?: ResourceItem[];
            totalPages?: number;
            totalElements?: number;
          };
          return {
            content: Array.isArray(obj?.content) ? obj.content : [],
            totalPages: typeof obj?.totalPages === "number" ? obj.totalPages : 1,
            totalElements:
              typeof obj?.totalElements === "number"
                ? obj.totalElements
                : obj?.content?.length ?? 0,
          };
        },
        enabled: isAllTab,
      },
    ],
  });

  const isProjectTab = activeTab === "프로젝트 모집";

  /** 자료방/프로젝트/나머지: 단일 API 조회 */
  const singleTabQuery = useQuery({
    queryKey: isArchiveTab
      ? ["resources", "my", pageIndex, pageSize]
      : isProjectTab
        ? ["project", "my", pageIndex, pageSize]
        : ["post", "my", categoryParam, pageIndex, pageSize],
    queryFn: async () => {
      if (isArchiveTab) {
        const res = await resourcesApi.getMyList({
          page: pageIndex,
          size: pageSize,
        });
        const payload =
          res.data && typeof res.data === "object" && "data" in res.data
            ? (res.data as { data?: unknown }).data
            : res.data;
        if (Array.isArray(payload)) return { content: payload, totalPages: 1 };
        const obj = payload as { content?: ResourceItem[]; totalPages?: number };
        return {
          content: Array.isArray(obj?.content) ? obj.content : [],
          totalPages: typeof obj?.totalPages === "number" ? obj.totalPages : 1,
        };
      }
      if (isProjectTab) {
        const res = await projectApi.getMyList({
          page: pageIndex,
          size: pageSize,
          category: 2,
        });
        return res.data;
      }
      return postApi.getMyPosts({
        category: categoryParam,
        page: pageIndex,
        size: pageSize,
      });
    },
    enabled: !isAllTab,
  });

  const postsQuery = isAllTab ? null : singleTabQuery;
  const allTabLoading = isAllTab && allTabQueries.some((r) => r.isPending);
  const allTabError = isAllTab && allTabQueries.some((r) => r.isError);

  const { posts, totalPages, archiveItems } = useMemo(() => {
    if (isAllTab) {
      const studyContent = extractContent(allTabQueries[0]?.data);
      const projectContent = extractContent(allTabQueries[1]?.data);
      const codingContent = extractContent(allTabQueries[2]?.data);
      const resourceData = allTabQueries[3]?.data as
        | { content?: ResourceItem[] }
        | undefined;
      const resourceContent = Array.isArray(resourceData?.content)
        ? resourceData.content
        : [];

      const studyPosts = studyContent.map((item) =>
        toMyPost(item, POST_CATEGORY.STUDY),
      );
      const projectPosts = projectContent.map((item) =>
        toMyPost(item, POST_CATEGORY.PROJECT),
      );
      const codingPosts = codingContent.map((item) =>
        toMyPost(item, POST_CATEGORY.CODING_TEST),
      );
      const resourcePosts: MyPost[] = resourceContent.map((r) => ({
        id: r.resourceId,
        category: "자료방",
        status: "모집 중" as PostStatus,
        title: r.title ?? "",
        content: "",
        tags: [],
        author:
          r.generation != null && r.authorName
            ? `${r.generation}기 ${r.authorName}`
            : r.authorName ?? "씨부엉 멤버",
        views: (r.views as number) ?? 0,
        comments: 0,
        time: r.createdAt ? formatTime(r.createdAt) : "-",
        href: r.link ?? "/archive",
        createdAt: r.createdAt,
      }));

      const merged = [
        ...studyPosts,
        ...projectPosts,
        ...codingPosts,
        ...resourcePosts,
      ].sort((a, b) => {
        const da = new Date(a.createdAt ?? 0).getTime();
        const db = new Date(b.createdAt ?? 0).getTime();
        return db - da;
      });

      const pageSizeAll = TAB_PAGE_SIZE["전체보기"];
      const paginated = merged.slice(
        pageIndex * pageSizeAll,
        (pageIndex + 1) * pageSizeAll,
      );

      const totalCount =
        extractTotalElements(allTabQueries[0]?.data) +
        extractTotalElements(allTabQueries[1]?.data) +
        extractTotalElements(allTabQueries[2]?.data) +
        extractResourcesTotal(resourceData);
      const totalPages = Math.max(
        1,
        Math.ceil(totalCount / TAB_PAGE_SIZE["전체보기"]),
      );

      return {
        posts: paginated,
        totalPages,
        archiveItems: [] as { id: number; title: string; link?: string; thumbnailUrl?: string; author: string; time: string; views: number }[],
      };
    }
    if (isArchiveTab) {
      const data = singleTabQuery.data as
        | { content?: ResourceItem[]; totalPages?: number }
        | undefined;
      const content = Array.isArray(data?.content) ? data.content : [];
      const tp = typeof data?.totalPages === "number" ? data.totalPages : 1;
      const items = content.map((r) => ({
        id: r.resourceId,
        title: r.title ?? "",
        link: r.link,
        thumbnailUrl: r.ogImage,
        author:
          r.generation != null && r.authorName
            ? `${r.generation}기 ${r.authorName}`
            : r.authorName ?? "씨부엉 멤버",
        time: r.createdAt ? formatTime(r.createdAt) : "-",
        views: (r.views as number) ?? 0,
      }));
      return {
        posts: [] as MyPost[],
        totalPages: Math.max(1, tp),
        archiveItems: items,
      };
    }
    const raw = singleTabQuery.data;
    const content = extractContent(raw);
    const tp = extractTotalPages(raw);
    const posts = content.map((item) => {
      const cat = item.category ?? categoryParam ?? 0;
      return toMyPost(item, cat);
    });
    return {
      posts,
      totalPages: Math.max(1, tp),
      archiveItems: [] as { id: number; title: string; link?: string; thumbnailUrl?: string; author: string; time: string; views: number }[],
    };
  }, [
    isAllTab,
    isArchiveTab,
    allTabQueries,
    singleTabQuery.data,
    categoryParam,
  ]);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="max-w-6xl mx-auto px-2 md:px-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
        나의 작성 목록
      </h1>

      {/* 카테고리 탭 필터 */}
      <div className="flex flex-wrap items-center gap-4 mb-8 text-sm">
        <button
          onClick={() => {
            setActiveTab("전체보기");
            setCurrentPage(1);
          }}
          className={`transition-colors ${activeTab === "전체보기" ? "text-gray-900 font-semibold" : "text-gray-400"}`}
        >
          전체보기({countByTab["전체보기"] ?? "-"})
        </button>
        {CATEGORY_LIST.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveTab(cat);
              setCurrentPage(1);
            }}
            className={`transition-colors ${activeTab === cat ? "text-gray-900 font-semibold" : "text-gray-400"}`}
          >
            {cat}({countByTab[cat] ?? "-"})
          </button>
        ))}
      </div>

      {isCountsLoading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <LoadingSpinner size="md" colorClassName="border-gray-400" />
          <p className="text-sm text-gray-500">목록을 불러오는 중...</p>
        </div>
      )}

      {!isCountsLoading && (
        <>
          {(isAllTab ? allTabLoading : postsQuery?.isLoading) && (
            <div className="text-center py-12 text-gray-500">
              목록을 불러오는 중...
            </div>
          )}
          {(isAllTab ? allTabError : postsQuery?.isError) && (
            <div className="text-center py-12 text-red-500">
              목록을 불러오지 못했습니다.
            </div>
          )}
        </>
      )}

      {!isCountsLoading &&
        !(isAllTab ? allTabLoading : postsQuery?.isLoading) &&
        !(isAllTab ? allTabError : postsQuery?.isError) && (
        <>
          {activeTab === "전체보기" && (
            <div className="flex flex-col gap-4">
              {posts.map((post) => {
                const isExternal = post.href.startsWith("http");
                const cardClass =
                  "group bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col hover:shadow-md transition-shadow cursor-pointer overflow-hidden";
                return isExternal ? (
                  <a
                    key={`${post.category}-${post.id}`}
                    href={post.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cardClass}
                  >
                    <AllViewCardContent post={post} />
                  </a>
                ) : (
                  <Link
                    key={`${post.category}-${post.id}`}
                    href={post.href}
                    className={cardClass}
                  >
                    <AllViewCardContent post={post} />
                  </Link>
                );
              })}
            </div>
          )}

          {activeTab === "스터디 모집" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {posts.map((post) => (
                <StudyCard
                  key={post.id}
                  id={post.id}
                  status={post.status}
                  title={post.title}
                  time={post.time}
                />
              ))}
            </div>
          )}

          {activeTab === "프로젝트 모집" && (
            <div className="flex flex-col gap-4">
              {posts.map((post) => (
                <ProjectCard
                  key={post.id}
                  id={post.id}
                  status={post.status}
                  title={post.title}
                  positions={post.tags}
                  author={post.author}
                  views={post.views}
                  time={post.time}
                  content={post.content}
                />
              ))}
            </div>
          )}

          {activeTab === "코딩테스트 준비" && (
            <div className="bg-white border border-gray-200 overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-[#95C674] text-white">
                  <tr>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 text-center text-xs sm:text-sm font-medium w-[80px] sm:w-[100px]">
                      상태
                    </th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 text-center text-xs sm:text-sm font-medium">
                      문제
                    </th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 text-center text-xs sm:text-sm font-medium w-[70px] sm:w-[100px]">
                      언어
                    </th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 text-center text-xs sm:text-sm font-medium w-[90px] sm:w-[120px]">
                      플랫폼
                    </th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 text-center text-xs sm:text-sm font-medium w-[90px] sm:w-[120px]">
                      작성자
                    </th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 text-center text-xs sm:text-sm font-medium w-[60px] sm:w-[80px]"></th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => {
                    const lang =
                      post.tags.find((t) => KNOWN_LANGUAGES.includes(t)) ||
                      "Python";
                    return (
                      <CodingTestRow
                        key={post.id}
                        id={post.id}
                        status={post.status === "모집 완료" ? "해결" : "미해결"}
                        title={post.title}
                        language={lang}
                        platform="프로그래머스"
                        comments={post.comments}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "자료방" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {archiveItems.map((item, index) => (
                <div key={`archive-${item.id}-${index}`} className="relative group">
                  <ArchiveCard
                    id={String(item.id)}
                    title={item.title}
                    link={item.link}
                    thumbnailUrl={item.thumbnailUrl}
                    uploadedBy={item.author}
                    uploadedAt={item.time}
                    views={item.views}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("이 자료를 삭제할까요?")) {
                        deleteResourceMutation.mutate(item.id);
                      }
                    }}
                    className="absolute top-3 right-3 z-10 rounded-full bg-black/60 text-white p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {posts.length === 0 && archiveItems.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              해당 카테고리에 작성한 글이 없습니다.
            </div>
          )}

          <PGN
            currentPage={currentPage}
            totalPages={pageNumbers}
            onPageChange={(num) => setCurrentPage(num)}
          />
        </>
      )}
    </div>
  );
}

// ============================================
// AllViewCardContent (전체보기 - 프로젝트 양식)
// ============================================

function AllViewCardContent({ post }: { post: MyPost }) {
  return (
    <>
      <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 sm:pb-5 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          {post.category === "자료방" ? (
            <span className="text-center py-2 px-3 rounded-full text-xs font-semibold text-white bg-gray-600">
              자료방
            </span>
          ) : (
            <span
              className={`text-center py-2 px-3 rounded-full text-xs font-semibold text-white ${
                post.status === "모집 완료" ? "bg-[#FC5E6E]" : "bg-[#45CD89]"
              }`}
            >
              {post.status}
            </span>
          )}
          <span className="ml-auto bg-gray-100 text-gray-700 text-xs font-medium flex items-center gap-1 px-3 py-1 rounded-full shrink-0">
            {post.category === "프로젝트 모집" ? (
              <>
                <Clock size={12} />
                마감일 {post.time}
              </>
            ) : (
              post.time
            )}
          </span>
        </div>
        <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug line-clamp-2">
          {post.title}
        </h3>
        {post.content && (
          <p className="text-sm text-gray-700 leading-relaxed line-clamp-2 max-h-0 overflow-hidden opacity-0 -mb-3 group-hover:max-h-20 group-hover:opacity-100 group-hover:mb-0 transition-all duration-300 ease-in-out">
            {post.content}
          </p>
        )}
      </div>
      <div className="mx-4 sm:mx-6 border-t border-gray-200" />
      <div className="bg-white px-4 sm:px-6 py-4 sm:py-5 flex justify-between items-center">
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((pos) => (
            <span
              key={pos}
              className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-[10px] font-semibold"
            >
              {pos}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-6 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Eye size={14} /> {post.views ?? 0}
          </span>
          {post.author && (
            <div className="flex items-center gap-1.5">
              <UserCircle size={18} className="text-gray-400" />
              <span className="text-gray-600 text-xs">{post.author}</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ============================================
// PostCard 컴포넌트 (전체보기용 - 레거시)
// ============================================

function PostCard({ post }: { post: MyPost }) {
  const isCompleted = post.status === "모집 완료";
  const isCodingTest = post.category === "코딩테스트 준비";
  const hasComments = (post.comments ?? 0) > 0;

  return (
    <Link
      href={post.href}
      className="group bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
    >
      <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-4 sm:pb-5 flex flex-col gap-3">
        <div className="flex items-center">
          <span
            className={`text-center py-2 px-4 rounded-full text-xs font-semibold text-white ${
              isCompleted ? "bg-[#FC5E6E]" : "bg-[#45CD89]"
            }`}
          >
            {post.status}
          </span>
        </div>
        <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug line-clamp-2">
          {post.title}
        </h3>
        <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
          {post.content}
        </p>
      </div>
      <div className="mx-4 sm:mx-6 border-t border-gray-200" />
      <div className="bg-white px-4 sm:px-6 py-4 sm:py-5 flex justify-between items-center">
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((pos) => (
            <span
              key={pos}
              className="bg-gray-100 text-gray-500 px-4 py-1.5 rounded-full text-sm font-semibold"
            >
              {pos}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-12 sm:gap-14 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <Eye size={14} /> {post.views}
          </span>
          {isCodingTest && hasComments && (
            <span className="flex items-center gap-1">
              <MessageCircle size={14} />
              {post.comments}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

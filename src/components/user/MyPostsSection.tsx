"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Eye } from "lucide-react";
import Link from "next/link";
import PGN from "@/components/shared/Pagination";
import { StudyCard } from "@/components/study/StudyCard";
import { ProjectCard } from "@/components/project/ProjectCard";
import { CodingTestRow } from "@/components/coding-test/CodingTestRow";
import ArchiveCard from "@/components/archive/card";
import { postApi, POST_CATEGORY } from "@/api";
import type { PostListItem } from "@/api";

// ============================================
// 타입 정의
// ============================================

/** 카테고리 필터 키 */
type PostCategory = "전체보기" | "스터디 모집" | "프로젝트 모집" | "코딩테스트 준비" | "자료방";

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
}

const CATEGORY_LIST: Exclude<PostCategory, "전체보기">[] = [
  "스터디 모집",
  "프로젝트 모집",
  "코딩테스트 준비",
  "자료방",
];

/** API 카테고리 번호 → 탭 라벨 */
const CATEGORY_NUM_TO_LABEL: Record<number, Exclude<PostCategory, "전체보기">> = {
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
  "전체보기": 12,
  "스터디 모집": 12,
  "프로젝트 모집": 10,
  "코딩테스트 준비": 10,
  "자료방": 12,
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

/** API content 배열 추출 */
function extractContent(raw: unknown): PostListItem[] {
  if (!raw || typeof raw !== "object") return [];
  const obj = raw as Record<string, unknown>;
  const data = obj.data ?? obj;
  if (Array.isArray(data)) return data as PostListItem[];
  if (data && typeof data === "object" && "content" in data)
    return ((data as { content?: unknown }).content ?? []) as PostListItem[];
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
  const tags = (item.studyTags ?? item.recruitmentFields ?? item.tags ?? []) as string[];
  const author =
    item.authorName != null
      ? item.authorGeneration != null
        ? `${item.authorGeneration}기 ${item.authorName}`
        : item.authorName
      : undefined;
  const postId = (item as { problemId?: number }).problemId ?? item.postId ?? (item as { id?: number }).id ?? 0;
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
    time: formatTime(item.createdAt as string),
    href: `${path}/${postId}`,
  };
}

/** 알려진 프로그래밍 언어 목록 (코딩테스트 매핑용) */
const KNOWN_LANGUAGES = ["Python", "Java", "C++", "JavaScript", "C"];

// ============================================
// MyPostsSection 컴포넌트
// ============================================

/** 탭 → API category 파라미터 */
const TAB_TO_CATEGORY: Record<PostCategory, number | undefined> = {
  "전체보기": undefined,
  "스터디 모집": POST_CATEGORY.STUDY,
  "프로젝트 모집": POST_CATEGORY.PROJECT,
  "코딩테스트 준비": POST_CATEGORY.CODING_TEST,
  "자료방": POST_CATEGORY.ARCHIVE,
};

export default function MyPostsSection() {
  const [activeTab, setActiveTab] = useState<PostCategory>("전체보기");
  const [currentPage, setCurrentPage] = useState(1);
  const pageIndex = Math.max(0, currentPage - 1);

  const categoryParam = TAB_TO_CATEGORY[activeTab];
  const pageSize = TAB_PAGE_SIZE[activeTab];

  const { data: myPostsRes, isLoading, isError } = useQuery({
    queryKey: ["post", "my", categoryParam, pageIndex, pageSize],
    queryFn: () =>
      postApi.getMyPosts({
        category: categoryParam,
        page: pageIndex,
        size: pageSize,
      }),
  });

  const { posts, totalPages, totalCount } = useMemo(() => {
    const raw = myPostsRes?.data;
    const content = extractContent(raw);
    const tp = extractTotalPages(raw);
    const data = raw as { totalElements?: number } | undefined;
    const totalCount = data?.totalElements ?? content.length;

    const posts = content.map((item) => {
      const cat = item.category ?? categoryParam ?? 0;
      return toMyPost(item, cat);
    });

    return {
      posts,
      totalPages: Math.max(1, tp),
      totalCount,
    };
  }, [myPostsRes, categoryParam]);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="max-w-6xl mx-auto">
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
          전체보기{activeTab === "전체보기" && totalCount >= 0 ? `(${totalCount})` : ""}
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
            {cat}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="text-center py-12 text-gray-500">목록을 불러오는 중...</div>
      )}
      {isError && (
        <div className="text-center py-12 text-red-500">
          목록을 불러오지 못했습니다.
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {activeTab === "전체보기" && (
            <div className="flex flex-col gap-4">
              {posts.map((post) => (
                <PostCard key={`${post.category}-${post.id}`} post={post} />
              ))}
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
                    <th className="py-2 sm:py-3 px-2 sm:px-4 text-center text-xs sm:text-sm font-medium w-[80px] sm:w-[100px]">상태</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 text-center text-xs sm:text-sm font-medium">문제</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 text-center text-xs sm:text-sm font-medium w-[70px] sm:w-[100px]">언어</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 text-center text-xs sm:text-sm font-medium w-[90px] sm:w-[120px]">플랫폼</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 text-center text-xs sm:text-sm font-medium w-[90px] sm:w-[120px]">작성자</th>
                    <th className="py-2 sm:py-3 px-2 sm:px-4 text-center text-xs sm:text-sm font-medium w-[60px] sm:w-[80px]"></th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => {
                    const lang = post.tags.find((t) => KNOWN_LANGUAGES.includes(t)) || "Python";
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
              {posts.map((post) => (
                <ArchiveCard
                  key={post.id}
                  id={String(post.id)}
                  title={post.title}
                  uploadedBy={post.author ?? "씨부엉"}
                  uploadedAt={post.time}
                  views={post.views}
                />
              ))}
            </div>
          )}

          {posts.length === 0 && (
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
// PostCard 컴포넌트 (전체보기용)
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

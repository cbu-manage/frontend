"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import RequireMember from "@/components/auth/RequireMember";
import Pagination from "@/components/shared/Pagination";
import Tabs from "@/components/common/Tabs";
import SearchBar from "@/components/common/SearchBar";
import { useFreeboardList } from "@/hooks/board";
import type { FreeBoardListItem } from "@/api";
import { formatDate } from "@/lib/date";

const CATEGORY_TABS = ["전체", "일상", "질문", "잡담", "홍보"] as const;
type CategoryTab = (typeof CATEGORY_TABS)[number];

export default function BoardPage() {
  const [activeTab, setActiveTab] = useState<CategoryTab>("전체");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useFreeboardList({ page: currentPage });

  const posts: FreeBoardListItem[] = data?.items ?? [];
  const totalPages = Array.from({ length: data?.totalPages ?? 1 }, (_, i) => i + 1);

  const filtered = posts.filter((p) => {
    const matchTab = activeTab === "전체" || (p.category as string | undefined) === activeTab;
    const matchSearch = (p.title ?? "").includes(search) || (p.authorName ?? "").includes(search);
    return matchTab && matchSearch;
  });

  return (
    <RequireMember>
      <main className="min-h-screen pb-16 bg-white">
        <div className="container-x-lg">
          <div className="pt-6 lg:pt-16 pb-6">
            <h1 className="text-h1 text-gray-900 mb-2">자유게시판</h1>
            <p className="text-gray-700">익명·실명 어떤 이름으로든 자유롭게 이야기해요 (부적절한 글은 신고)</p>
          </div>

          {/* 탭 + 검색 + 글 작성 */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <Tabs
              items={CATEGORY_TABS.map((t) => ({ label: t, value: t }))}
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as CategoryTab)}
            />
          </div>
          <div className="flex w-full items-center justify-end gap-3 mb-4">
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="제목 · 내용으로 검색해주세요."
              className="w-full sm:w-80"
            />
            <Link
              href="/board/write"
              className="flex shrink-0 items-center gap-2 rounded-full bg-gray-800 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-700"
            >
              <Pencil size={16} /> 글 작성하기
            </Link>
          </div>

          {/* 테이블 */}
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="flex items-center gap-8 px-2 py-3 bg-brand text-sm font-bold text-white">
              <span className="w-28 text-center shrink-0">작성자</span>
              <span className="flex-1 text-center">제목</span>
              <span className="w-28 text-center shrink-0">작성일</span>
              <span className="w-20 text-center shrink-0">조회</span>
            </div>

            {isLoading ? (
              <div className="py-16 text-center text-sm text-gray-400">불러오는 중...</div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center text-sm text-gray-900">
                {search ? "검색 결과가 없습니다." : "게시글이 없습니다."}
              </div>
            ) : (
              filtered.map((post) => (
                <Link
                  key={post.postId}
                  href={`/board/${post.postId}`}
                  className="flex items-center gap-8 px-2 py-6 border-b border-gray-100 transition-colors hover:bg-gray-50"
                >
                  <span className="w-28 text-center shrink-0 text-sm text-gray-900 truncate">
                    {post.isAnonymous ? "익명" : (post.authorName ?? "")}
                  </span>
                  <span className="flex-1 flex items-center gap-1.5 min-w-0 text-sm text-gray-900">
                    <span className="truncate">{post.title}</span>
                    {(post.commentCount ?? 0) > 0 && (
                      <span className="shrink-0 text-brand text-xs">[{post.commentCount}]</span>
                    )}
                  </span>
                  <span className="w-28 text-center shrink-0 text-sm text-gray-900">
                    {post.createdAt ? formatDate(post.createdAt as string) : ""}
                  </span>
                  <span className="w-20 text-center shrink-0 text-sm text-gray-900">
                    {post.viewCount ?? 0}
                  </span>
                </Link>
              ))
            )}
          </div>

          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                setSearch("");
              }}
            />
          </div>
        </div>
      </main>
    </RequireMember>
  );
}

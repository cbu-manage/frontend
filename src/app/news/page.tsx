"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import RequireMember from "@/components/auth/RequireMember";
import Pagination from "@/components/shared/Pagination";
import Tabs from "@/components/common/Tabs";
import SearchBar from "@/components/common/SearchBar";
import { useIsStaff } from "@/hooks/auth/useIsStaff";
import { useNewsList } from "@/hooks/news/useNewsList";
import { formatDate } from "@/lib/date";

const CATEGORY_TABS = ["전체", "주간", "특집"] as const;
type CategoryTab = (typeof CATEGORY_TABS)[number];

export default function NewsPage() {
  const isStaff = useIsStaff();
  const [activeTab, setActiveTab] = useState<CategoryTab>("전체");
  const [search, setSearch] = useState("");
  const [submittedKeyword, setSubmittedKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const runSearch = () => {
    setSubmittedKeyword(search.trim());
    setCurrentPage(1);
  };

  const { data, isLoading, isError } = useNewsList({
    category: "NEWSLETTER",
    keyword: submittedKeyword || undefined,
    page: currentPage,
    size: 11,
  });

  const items = data?.content ?? [];
  const totalPages = data?.page?.totalPages
    ? Array.from({ length: data.page.totalPages }, (_, i) => i + 1)
    : [1];

  return (
    <RequireMember>
      <main className="min-h-screen pb-16 bg-white">
        <div className="container-x-lg">
          <div className="pt-6 lg:pt-16 pb-6">
            <h1 className="text-h1 text-gray-900 mb-2">뉴스레터</h1>
            <p className="text-base text-gray-700">동아리 뉴스레터와 소식을 확인하세요</p>
          </div>

          {/* 탭 + 검색 + 글 작성 */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <Tabs
              items={CATEGORY_TABS.map((t) => ({ label: t, value: t }))}
              value={activeTab}
              onValueChange={(v) => {
                setActiveTab(v as CategoryTab);
                setCurrentPage(1);
              }}
            />
            <div className="flex w-full items-center gap-3 sm:w-auto">
              <SearchBar
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") runSearch(); }}
                placeholder="제목 · 내용으로 검색해주세요."
                className="w-full sm:w-80"
              />
              {isStaff && (
                <Link
                  href="/news/write"
                  className="flex shrink-0 items-center gap-2 rounded-full bg-gray-800 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-700"
                >
                  <Pencil size={16} /> 글 작성하기
                </Link>
              )}
            </div>
          </div>

          {/* 테이블 */}
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="flex items-center gap-8 px-2 py-3 bg-brand text-sm font-bold text-white">
              <span className="w-28 text-center shrink-0">카테고리</span>
              <span className="flex-1 text-center">제목</span>
              <span className="w-28 text-center shrink-0">작성일</span>
              <span className="w-20 text-center shrink-0">조회</span>
            </div>
            {isLoading && (
              <div className="py-16 text-center text-sm text-gray-500">불러오는 중…</div>
            )}
            {!isLoading && isError && (
              <div className="py-16 text-center text-sm text-gray-500">목록을 불러오지 못했습니다.</div>
            )}
            {!isLoading && !isError && items.length === 0 && (
              <div className="py-16 text-center text-sm text-gray-900">검색 결과가 없습니다.</div>
            )}
            {!isLoading && !isError &&
              items.map((news) => (
                <Link
                  key={news.newsId}
                  href={`/news/${news.newsId}`}
                  className="flex items-center gap-8 px-2 py-6 border-b border-gray-100 transition-colors hover:bg-gray-50"
                >
                  <span className="w-28 text-center shrink-0 text-sm text-gray-900">
                    [뉴스레터]
                  </span>
                  <span className="flex-1 min-w-0 text-sm text-gray-900">
                    <span className="block truncate">{news.title}</span>
                  </span>
                  <span className="w-28 text-center shrink-0 text-sm text-gray-900">
                    {formatDate(news.createdAt)}
                  </span>
                  <span className="w-20 text-center shrink-0 text-sm text-gray-900">{news.viewCount}</span>
                </Link>
              ))}
          </div>

          <div className="mt-8">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </div>
      </main>
    </RequireMember>
  );
}

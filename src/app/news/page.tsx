"use client";

import { useState } from "react";
import Link from "next/link";
import RequireMember from "@/components/auth/RequireMember";
import { useUserStore } from "@/store/userStore";
import Pagination from "@/components/shared/Pagination";
import Tabs from "@/components/common/Tabs";
import SearchBar from "@/components/common/SearchBar";

const CATEGORY_TABS = ["전체", "주간", "특집"] as const;
type CategoryTab = (typeof CATEGORY_TABS)[number];

// TODO: API 연동 후 교체
type NewsItem = {
  id: number;
  category: string;
  title: string;
  author: string;
  date: string;
  views: number;
};
const MOCK_NEWS: NewsItem[] = [
  { id: 1, category: "주간", title: "4월 4주차 주간 뉴스레터", author: "15기 김민주", date: "2026.04.28", views: 210 },
  { id: 2, category: "특집", title: "[특집] 2026 신입 모집 결산", author: "14기 이서연", date: "2026.04.25", views: 255 },
  { id: 3, category: "주간", title: "4월 3주차 주간 뉴스레터", author: "14기 이서연", date: "2026.04.21", views: 96 },
  { id: 4, category: "특집", title: "[특집] 졸업 선배 인터뷰 모음", author: "15기 정하인", date: "2026.04.18", views: 188 },
  { id: 5, category: "주간", title: "4월 2주차 주간 뉴스레터", author: "14기 박도윤", date: "2026.04.14", views: 72 },
  { id: 6, category: "특집", title: "[특집] 씨부엉 해커톤 2026 후기", author: "15기 최준호", date: "2026.04.10", views: 201 },
  { id: 7, category: "주간", title: "4월 1주차 주간 뉴스레터", author: "14기 이서연", date: "2026.04.07", views: 64 },
  { id: 8, category: "특집", title: "[특집] 1분기 활동 회고", author: "15기 김민주", date: "2026.03.31", views: 143 },
  { id: 9, category: "주간", title: "3월 4주차 주간 뉴스레터", author: "14기 박도윤", date: "2026.03.24", views: 61 },
  { id: 10, category: "주간", title: "3월 3주차 주간 뉴스레터", author: "14기 이서연", date: "2026.03.17", views: 54 },
  { id: 11, category: "특집", title: "[특집] 신규 부원 환영 인터뷰", author: "15기 정하인", date: "2026.03.12", views: 177 },
];

export default function NewsPage() {
  const isAdmin = useUserStore((s) => s.isAdmin);
  const [activeTab, setActiveTab] = useState<CategoryTab>("전체");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  // 페이지당 최대 11개 게시물 (API 연동 시 size=11로 요청). 현재는 목데이터.
  const totalPages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const filtered = MOCK_NEWS.filter((n) => {
    const matchTab = activeTab === "전체" || n.category === activeTab;
    const matchSearch = n.title.includes(search) || n.author.includes(search);
    return matchTab && matchSearch;
  });

  return (
    <RequireMember>
      <main className="min-h-screen pb-16 bg-white">
        <div className="container-x-lg">
          <div className="pt-6 lg:pt-16 pb-6 flex items-start justify-between">
            <div>
              <h1 className="text-h1 text-gray-900 mb-2">뉴스레터</h1>
              <p className="text-base text-gray-700">동아리 뉴스레터와 소식을 확인하세요</p>
            </div>
            {isAdmin && (
              <Link
                href="/news/write"
                className="px-5 py-2.5 bg-gray-900 text-white rounded-lg font-medium text-sm hover:bg-gray-700 transition-colors"
              >
                + 글쓰기
              </Link>
            )}
          </div>

          {/* 탭 + 검색 */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <Tabs
              items={CATEGORY_TABS.map((t) => ({ label: t, value: t }))}
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as CategoryTab)}
            />
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="제목 · 작성자로 검색"
              className="w-96 shrink-0"
            />
          </div>

          {/* 테이블 */}
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="flex items-center gap-4 px-2 py-3 bg-brand text-sm font-bold text-white">
              <span className="w-28 text-center shrink-0">카테고리</span>
              <span className="flex-1 text-center">제목</span>
              <span className="w-28 text-center shrink-0">작성자</span>
              <span className="w-28 text-center shrink-0">작성일</span>
              <span className="w-20 text-center shrink-0">조회</span>
            </div>
            {filtered.map((news) => (
              <Link
                key={news.id}
                href={`/news/${news.id}`}
                className="flex items-center gap-4 px-2 py-5 border-b border-gray-100 transition-colors hover:bg-gray-50"
              >
                <span className="w-28 text-center shrink-0 text-sm text-gray-900">[{news.category}]</span>
                <span className="flex-1 min-w-0 text-sm text-gray-900">
                  <span className="block truncate">{news.title}</span>
                </span>
                <span className="w-28 text-center shrink-0 text-sm text-gray-900">{news.author}</span>
                <span className="w-28 text-center shrink-0 text-sm text-gray-900">{news.date}</span>
                <span className="w-20 text-center shrink-0 text-sm text-gray-900">{news.views}</span>
              </Link>
            ))}
            {filtered.length === 0 && (
              <div className="py-16 text-center text-sm text-gray-900">검색 결과가 없습니다.</div>
            )}
          </div>

          <div className="mt-8">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </div>
      </main>
    </RequireMember>
  );
}

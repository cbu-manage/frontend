"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import RequireMember from "@/components/auth/RequireMember";
import Pagination from "@/components/shared/Pagination";

const CATEGORY_TABS = ["전체", "일상", "질문", "잡담", "홍보"] as const;
type CategoryTab = (typeof CATEGORY_TABS)[number];

// TODO: API 연동 후 교체
const MOCK_POSTS = [
  { id: 1, category: "공지", title: "🚩 자유게시판 이용 가이드 — 익명·실명·신고 기능 안내", author: "운영진 15기 김민주", date: "2026.04.18", views: 248 },
  { id: 2, category: "일반", title: "코딩테스트 준비 같이 봐 게신가요?", author: "익명47", date: "2026.04.15", views: 172 },
  { id: 3, category: "잡담", title: "이번 주말 점심 카페 추천 좀 부탁드려요", author: "14기 정하은", date: "2026.04.12", views: 89 },
  { id: 4, category: "질문", title: "백엔드 면접 후기 — 너무 떨려서 망친 듯ㅠ", author: "익명12", date: "2026.04.10", views: 156 },
  { id: 5, category: "잡담", title: "3박년 코딩 캡스톤 어떻게 준비하시나요", author: "익명83", date: "2026.04.08", views: 103 },
  { id: 6, category: "홍보", title: "동아리방 와이파이 자꾸 끊겨요", author: "15기 박도윤", date: "2026.04.05", views: 84 },
  { id: 7, category: "잡담", title: "Claude Max 같이 쓰실 분 3명 더 모집", author: "익명28", date: "2026.04.02", views: 212 },
  { id: 8, category: "질문", title: "OT 단체사진 어디서 받을 수 있나요", author: "익명54", date: "2026.03.31", views: 98 },
];

export default function BoardPage() {
  const [activeTab, setActiveTab] = useState<CategoryTab>("전체");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const filtered = MOCK_POSTS.filter((p) => {
    const matchTab = activeTab === "전체" || p.category === activeTab;
    const matchSearch = p.title.includes(search) || p.author.includes(search);
    return matchTab && matchSearch;
  });

  return (
    <RequireMember>
      <main className="min-h-screen pb-16 bg-white">
        <div className="container-x-lg">
          <div className="pt-6 lg:pt-16 pb-6 flex items-start justify-between">
            <div>
              <h1 className="text-h1 text-gray-900 mb-2">자유게시판</h1>
              <p className="text-base text-gray-700">익명·실명 어떤 이름으로든 자유롭게 이야기해요 (부적절한 글은 신고)</p>
            </div>
            <Link
              href="/board/write"
              className="px-5 py-2.5 bg-gray-900 text-white rounded-lg font-medium text-sm hover:bg-gray-700 transition-colors"
            >
              + 글쓰기
            </Link>
          </div>

          {/* 탭 + 검색 */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-1">
              {CATEGORY_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={
                    activeTab === tab
                      ? "px-3 py-1 rounded-full text-sm font-medium bg-gray-800 text-white transition-colors"
                      : "px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
                  }
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 w-56">
              <Search size={14} className="text-gray-400 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="제목 · 작성자로 검색"
                className="flex-1 text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
              />
            </div>
          </div>

          {/* 테이블 */}
          <div className="border-t border-gray-200">
            <div className="flex items-center gap-4 px-2 py-2.5 border-b border-gray-100 text-xs text-gray-400">
              <span className="w-16 shrink-0">카테고리</span>
              <span className="flex-1">제목</span>
              <span className="w-24 text-right shrink-0">작성자</span>
              <span className="w-24 text-right shrink-0">작성일</span>
              <span className="w-10 text-right shrink-0">조회</span>
            </div>
            {filtered.map((post) => (
              <Link
                key={post.id}
                href={`/board/${post.id}`}
                className="flex items-center gap-4 px-2 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <span className="w-16 shrink-0 text-sm text-gray-500">[{post.category}]</span>
                <span className="flex-1 text-sm text-gray-900 truncate">{post.title}</span>
                <span className="w-24 text-right shrink-0 text-sm text-gray-500 truncate">{post.author}</span>
                <span className="w-24 text-right shrink-0 text-sm text-gray-400">{post.date}</span>
                <span className="w-10 text-right shrink-0 text-sm text-gray-400">{post.views}</span>
              </Link>
            ))}
            {filtered.length === 0 && (
              <div className="py-16 text-center text-sm text-gray-400">검색 결과가 없습니다.</div>
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

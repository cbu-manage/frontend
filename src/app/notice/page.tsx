"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import RequireMember from "@/components/auth/RequireMember";
import { useUserStore } from "@/store/userStore";
import Pagination from "@/components/shared/Pagination";

const CATEGORY_TABS = ["전체", "공지", "이벤트", "뉴스레터", "IT소식"] as const;
type CategoryTab = (typeof CATEGORY_TABS)[number];

// TODO: API 연동 후 교체
const MOCK_NOTICES = [
  { id: 1, category: "공지", title: "2026학년도 16기 정기 모집 안내 — 신규 부원 환영합니다", author: "15기 김민주", date: "2026.04.18", views: 248 },
  { id: 2, category: "이벤트", title: "씨부엉 해커톤 2026 개최 · 팀 구성 / 상품 · 멘토 안내", author: "14기 이서연", date: "2026.04.15", views: 172 },
  { id: 3, category: "뉴스레터", title: "4월 3주차 뉴스레터", author: "14기 박도윤", date: "2026.04.12", views: 89 },
  { id: 4, category: "공지", title: "4월 정기 모임 일정 변경 (4/21 → 4/23)", author: "15기 최준호", date: "2026.04.10", views: 156 },
  { id: 5, category: "이벤트", title: "알고리즘 챌린지 4월 배점 및 경품 수령 안내", author: "15기 정하인", date: "2026.04.08", views: 103 },
  { id: 6, category: "IT소식", title: "Claude Max 이용 한도 상향", author: "14기 윤지우", date: "2026.04.05", views: 84 },
  { id: 7, category: "공지", title: "동아리방 이용 규칙 업데이트", author: "15기 김민주", date: "2026.04.02", views: 212 },
  { id: 8, category: "뉴스레터", title: "3월 월간 회고 · 뉴스레터 준비 이야기", author: "14기 이서연", date: "2026.03.31", views: 98 },
];

export default function NoticePage() {
  const isAdmin = useUserStore((s) => s.isAdmin);
  const [activeTab, setActiveTab] = useState<CategoryTab>("전체");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const filtered = MOCK_NOTICES.filter((n) => {
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
              <h1 className="text-h1 text-gray-900 mb-2">씨부엉 소식</h1>
              <p className="text-base text-gray-700">동아리 공지와 새 소식을 확인하세요</p>
            </div>
            {isAdmin && (
              <Link href="/notice/write">
                <button className="px-5 py-2.5 bg-gray-900 text-white rounded-lg font-medium text-sm hover:bg-gray-700 transition-colors">
                  + 글쓰기
                </button>
              </Link>
            )}
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
                placeholder="제목 · 내용으로 검색"
                className="flex-1 text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
              />
            </div>
          </div>

          {/* 테이블 */}
          <div className="border-t border-gray-200">
            <div className="flex items-center gap-4 px-2 py-2.5 border-b border-gray-100 text-xs text-gray-400">
              <span className="w-24 shrink-0">카테고리</span>
              <span className="flex-1">제목</span>
              <span className="w-20 text-right shrink-0">작성자</span>
              <span className="w-24 text-right shrink-0">작성일</span>
              <span className="w-10 text-right shrink-0">조회</span>
            </div>
            {filtered.map((notice) => (
              <Link
                key={notice.id}
                href={`/notice/${notice.id}`}
                className="flex items-center gap-4 px-2 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <span className="w-24 shrink-0 text-sm text-gray-500">[{notice.category}]</span>
                <span className="flex-1 text-sm text-gray-900 truncate">{notice.title}</span>
                <span className="w-20 text-right shrink-0 text-sm text-gray-500">{notice.author}</span>
                <span className="w-24 text-right shrink-0 text-sm text-gray-400">{notice.date}</span>
                <span className="w-10 text-right shrink-0 text-sm text-gray-400">{notice.views}</span>
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

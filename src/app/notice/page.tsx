"use client";

import { useState } from "react";
import Link from "next/link";
import { Pin } from "lucide-react";
import RequireMember from "@/components/auth/RequireMember";
import { useUserStore } from "@/store/userStore";
import Pagination from "@/components/shared/Pagination";
import Tabs from "@/components/common/Tabs";
import SearchBar from "@/components/common/SearchBar";

const CATEGORY_TABS = ["전체", "공지", "이벤트", "IT소식"] as const;
type CategoryTab = (typeof CATEGORY_TABS)[number];

// TODO: API 연동 후 교체
type NoticeItem = {
  id: number;
  category: string;
  title: string;
  author: string;
  date: string;
  views: number;
  pinned?: boolean;
};
const MOCK_NOTICES: NoticeItem[] = [
  { id: 1, category: "공지", title: "2026학년도 16기 정기 모집 안내 — 신규 부원 환영합니다", author: "15기 김민주", date: "2026.04.18", views: 248, pinned: true },
  { id: 2, category: "이벤트", title: "씨부엉 해커톤 2026 개최 · 팀 구성 / 상품 · 멘토 안내", author: "14기 이서연", date: "2026.04.15", views: 172 },
  { id: 3, category: "공지", title: "4월 정기 세미나 일정 안내", author: "14기 박도윤", date: "2026.04.12", views: 89 },
  { id: 4, category: "공지", title: "4월 정기 모임 일정 변경 (4/21 → 4/23)", author: "15기 최준호", date: "2026.04.10", views: 156 },
  { id: 5, category: "이벤트", title: "알고리즘 챌린지 4월 배점 및 경품 수령 안내", author: "15기 정하인", date: "2026.04.08", views: 103 },
  { id: 6, category: "IT소식", title: "Claude Max 이용 한도 상향", author: "14기 윤지우", date: "2026.04.05", views: 84 },
  { id: 7, category: "공지", title: "동아리방 이용 규칙 업데이트", author: "15기 김민주", date: "2026.04.02", views: 212, pinned: true },
  { id: 8, category: "이벤트", title: "동아리 봄 MT 사전 수요조사", author: "14기 이서연", date: "2026.03.31", views: 98 },
  { id: 9, category: "이벤트", title: "5월 워크샵 사전 신청 안내", author: "15기 김민주", date: "2026.03.28", views: 77 },
  { id: 10, category: "IT소식", title: "GitHub Copilot 학생 인증 가이드", author: "14기 윤지우", date: "2026.03.25", views: 142 },
  { id: 11, category: "IT소식", title: "GitHub Organization 초대 안내", author: "14기 이서연", date: "2026.03.22", views: 61 },
];

export default function NoticePage() {
  const isAdmin = useUserStore((s) => s.isAdmin);
  const [activeTab, setActiveTab] = useState<CategoryTab>("전체");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  // 페이지당 최대 11개 게시물 (API 연동 시 size=11로 요청). 현재는 목데이터.
  const totalPages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // 상단 고정(pinned) 먼저, 그 외는 기존(최신) 순서 유지
  const filtered = MOCK_NOTICES.filter((n) => {
    const matchTab = activeTab === "전체" || n.category === activeTab;
    const matchSearch = n.title.includes(search) || n.author.includes(search);
    return matchTab && matchSearch;
  }).sort((a, b) => Number(b.pinned ?? false) - Number(a.pinned ?? false));

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
              <Link
                href="/notice/write"
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
            {filtered.map((notice) => (
              <Link
                key={notice.id}
                href={`/notice/${notice.id}`}
                className={`flex items-center gap-4 px-2 py-5 border-b border-gray-100 transition-colors ${
                  notice.pinned ? "bg-brand/5 hover:bg-brand/10" : "hover:bg-gray-50"
                }`}
              >
                <span className="w-28 text-center shrink-0 text-sm text-gray-900">[{notice.category}]</span>
                <span className="flex-1 flex items-center gap-1.5 min-w-0 text-sm text-gray-900">
                  {notice.pinned && (
                    <Pin size={13} className="shrink-0 text-brand fill-brand" />
                  )}
                  <span className="truncate">{notice.title}</span>
                </span>
                <span className="w-28 text-center shrink-0 text-sm text-gray-900">{notice.author}</span>
                <span className="w-28 text-center shrink-0 text-sm text-gray-900">{notice.date}</span>
                <span className="w-20 text-center shrink-0 text-sm text-gray-900">{notice.views}</span>
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

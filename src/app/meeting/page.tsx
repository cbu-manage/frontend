"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import RequireMember from "@/components/auth/RequireMember";
import Pagination from "@/components/shared/Pagination";
import Tabs from "@/components/common/Tabs";
import MeetingCard from "@/components/meeting/MeetingCard";
import { useIsStaff } from "@/hooks/auth/useIsStaff";

// TODO: API 연동 후 교체
type Meeting = {
  id: number;
  category: string; // 모임 / MT / 회식
  done: boolean; // false=모집 중(진행 예정), true=모집 완료(지난 모임)
  title: string;
  date: string;
  location: string;
  responded: number; // 참석 응답 / 최종 참석 인원
  capacity: number; // 정원
};

const MOCK_MEETINGS: Meeting[] = [
  { id: 1, category: "모임", done: false, title: "2026 봄학기 신입 환영회", date: "2026.04.20 (토) 18:00", location: "학교 후문 OO치킨 2층", responded: 16, capacity: 15 },
  { id: 2, category: "MT", done: false, title: "여름 워크샵 1박 2일 MT", date: "2026.06.15 (월) 09:00 ~ 06.16 (화)", location: "가평 OO펜션 전관", responded: 12, capacity: 15 },
  { id: 3, category: "회식", done: true, title: "3월 친목 도모 회식", date: "2026.03.28 (금) 19:00", location: "종강 펌 본점", responded: 12, capacity: 15 },
  { id: 4, category: "모임", done: false, title: "4월 정기 모임 — 프로젝트 중간 공유", date: "2026.04.12 (토) 14:00", location: "동아리방 (공학관 401)", responded: 9, capacity: 15 },
  { id: 5, category: "MT", done: false, title: "신입 환영 단합 MT", date: "2026.05.10 (토) 10:00 ~ 05.11 (일)", location: "양평 OO글램핑", responded: 14, capacity: 15 },
  { id: 6, category: "회식", done: true, title: "해커톤 뒷풀이 회식", date: "2026.03.15 (토) 20:00", location: "정자동 OO포차", responded: 18, capacity: 20 },
  { id: 7, category: "모임", done: false, title: "5월 정기 세미나 + 번개 모임", date: "2026.05.02 (금) 19:00", location: "동아리방 (공학관 401)", responded: 7, capacity: 15 },
  { id: 8, category: "회식", done: true, title: "2월 종강 기념 회식", date: "2026.02.21 (금) 18:30", location: "야탑 OO고깃집", responded: 15, capacity: 15 },
  { id: 9, category: "MT", done: false, title: "임원진 워크샵", date: "2026.05.24 (토) 13:00", location: "수원 OO세미나실", responded: 8, capacity: 10 },
  { id: 10, category: "모임", done: false, title: "졸업 선배 초청 네트워킹", date: "2026.05.30 (금) 18:00", location: "교내 창업보육센터", responded: 11, capacity: 20 },
  { id: 11, category: "회식", done: true, title: "1월 신년 모임", date: "2026.01.10 (금) 18:00", location: "강남 OO이자카야", responded: 13, capacity: 15 },
];

type StatusTab = "전체" | "진행 예정" | "지난 모임";

export default function MeetingPage() {
  const isStaff = useIsStaff();
  const [activeTab, setActiveTab] = useState<StatusTab>("전체");
  const [currentPage, setCurrentPage] = useState(1);
  // 페이지당 최대 12개 (3열 × 4행). API 연동 시 size=12로 요청.
  const totalPages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const upcomingCount = MOCK_MEETINGS.filter((m) => !m.done).length;
  const pastCount = MOCK_MEETINGS.filter((m) => m.done).length;

  const filtered = MOCK_MEETINGS.filter((m) => {
    if (activeTab === "진행 예정") return !m.done;
    if (activeTab === "지난 모임") return m.done;
    return true;
  });

  return (
    <RequireMember>
      <main className="min-h-screen pb-16 bg-white">
        <div className="container-x-lg">
          <div className="pt-6 lg:pt-16 pb-6">
            <h1 className="text-h1 text-gray-900 mb-2">모임</h1>
            <p className="text-base text-gray-700">
              회식 · MT · 박람회 등 동아리 모임 일정에 참석 여부를 응답하세요
            </p>
          </div>

          {/* 탭 + 글 작성 */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <Tabs
              items={[
                { label: "전체", value: "전체" },
                { label: `진행 예정 (${upcomingCount})`, value: "진행 예정" },
                { label: `지난 모임 (${pastCount})`, value: "지난 모임" },
              ]}
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as StatusTab)}
            />
            {isStaff && (
              <Link
                href="/meeting/write"
                className="flex shrink-0 items-center gap-2 rounded-full bg-gray-800 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-700"
              >
                <Pencil size={16} /> 새 모임 등록
              </Link>
            )}
          </div>

          {/* 카드 그리드 — 3열 × 4행 = 최대 12개 */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((m) => (
              <MeetingCard
                key={m.id}
                href={`/meeting/${m.id}`}
                category={m.category}
                done={m.done}
                title={m.title}
                date={m.date}
                location={m.location}
                responded={m.responded}
                capacity={m.capacity}
              />
            ))}
          </div>

          <div className="mt-10">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </div>
      </main>
    </RequireMember>
  );
}

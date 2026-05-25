"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Sparkles, Search, CalendarIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";

import RequireMember from "@/components/auth/RequireMember";
import ReportCard from "@/components/report/ReportCard";
import Pagination from "@/components/shared/Pagination";
import { groupApi, type MyGroupItem } from "@/api";

// TODO: API 연동 후 교체
const MOCK_REPORTS = [
  { id: 1, tag: "프론트엔드", title: "2026년 4월 정기활동 보고서", author: "15기 김민주", date: "04.18", files: ["HWP", "PDF"] },
  { id: 2, tag: "프론트엔드", title: "3월 스프린트 회고", author: "15기 김민주", date: "03.31", files: ["HWP", "PDF"] },
  { id: 3, tag: "기획", title: "4월 유저 인터뷰 결과", author: "15기 김민주", date: "04.12", files: ["HWP", "PDF"] },
];

function extractMyGroups(raw: unknown): MyGroupItem[] {
  if (!raw || typeof raw !== "object") return [];
  const obj = raw as Record<string, unknown>;
  const data = obj.data ?? obj;
  if (Array.isArray(data)) return data as MyGroupItem[];
  if (data && typeof data === "object" && "content" in data) {
    const arr = (data as { content?: unknown }).content;
    return Array.isArray(arr) ? (arr as MyGroupItem[]) : [];
  }
  return [];
}

export default function ReportPage() {
  const router = useRouter();
  // TODO: API 연동 후 아래 두 줄 및 관련 조건 제거 (isPreview 사용처 모두 삭제)
  const searchParams = useSearchParams();
  const isPreview = searchParams.get("preview") === "1";
  const [activeGroup, setActiveGroup] = useState("전체");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [calendarOpenStart, setCalendarOpenStart] = useState(false);
  const [calendarOpenEnd, setCalendarOpenEnd] = useState(false);
  const startRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (startRef.current && !startRef.current.contains(e.target as Node)) setCalendarOpenStart(false);
      if (endRef.current && !endRef.current.contains(e.target as Node)) setCalendarOpenEnd(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = [1]; // TODO: API 연동 후 실제 totalPages로 교체

  const { data: res, isLoading, isError } = useQuery({
    queryKey: ["myGroups"],
    queryFn: () => groupApi.getMyGroups(),
  });

  const allGroups = extractMyGroups(res?.data ?? null);
  const mockTags = ["전체", ...Array.from(new Set(MOCK_REPORTS.map((r) => r.tag)))];
  const groupTabs = allGroups.length > 0
    ? ["전체", ...allGroups.map((g: MyGroupItem) => g.groupName)]
    : mockTags;

  const filtered = MOCK_REPORTS.filter((r) => {
    const matchGroup = activeGroup === "전체" || r.tag === activeGroup;
    const matchSearch = r.title.includes(search) || r.author.includes(search);
    return matchGroup && matchSearch;
  });

  return (
    <RequireMember>
      <main className="min-h-screen pb-16 bg-white">
        <div className="container-x-lg">
          <div className="pt-6 lg:pt-16 pb-6">
            <h1 className="text-h1 text-gray-900 mb-2">내 보고서</h1>
            <p className="text-base text-gray-600">본인이 속한 스터디·멤버가 작성한 보고서만 조회됩니다.</p>
          </div>

          {isLoading && (
            <div className="text-center py-16 text-gray-500">불러오는 중...</div>
          )}
          {isError && (
            <div className="text-center py-16 text-red-500">목록을 불러오지 못했습니다.</div>
          )}

          {/* 그룹 없음 — 빈 상태 */}
          {!isLoading && !isError && allGroups.length === 0 && !isPreview && (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 py-20 px-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8F5E3]">
                <Sparkles className="h-8 w-8 text-[#5a9b4a]" strokeWidth={2} />
              </div>
              <p className="text-lg font-semibold text-gray-700 mb-2">아직 가입한 스터디/프로젝트가 없어요</p>
              <p className="text-gray-500 max-w-sm mx-auto">
                스터디·프로젝트에 참여하고 보고서를 올려보세요!
                <br />
                <Link href="/study" className="mt-3 inline-block text-[#5a9b4a] font-medium hover:underline">스터디 둘러보기 →</Link>
                {" · "}
                <Link href="/project" className="text-[#5a9b4a] font-medium hover:underline">프로젝트 둘러보기 →</Link>
              </p>
            </div>
          )}

          {/* 그룹 있음 — 보고서 뷰 */}
          {!isLoading && !isError && (allGroups.length > 0 || isPreview) && (
            <>
              {/* 업로드 버튼 */}
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => router.push("/report/write")}
                  className="px-5 py-2.5 bg-gray-900 text-white rounded-lg font-medium text-sm hover:bg-gray-700 transition-colors shrink-0"
                >
                  + 새 보고서 업로드
                </button>
              </div>

              {/* 필터 */}
              <div className="rounded-xl border border-gray-200 bg-white p-4 mb-6 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-medium text-gray-700 shrink-0 whitespace-nowrap">스터디</span>
                  {groupTabs.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setActiveGroup(g)}
                      className={
                        activeGroup === g
                          ? "px-3 py-1 rounded-full text-sm font-medium bg-gray-800 text-white transition-colors"
                          : "px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
                      }
                    >
                      {g}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 shrink-0 w-8">기간</span>
                  <div ref={startRef} className="relative">
                    <button
                      type="button"
                      onClick={() => { setCalendarOpenStart((v) => !v); setCalendarOpenEnd(false); }}
                      className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm flex items-center gap-2 bg-white focus:outline-none focus:ring-1 focus:ring-gray-300"
                    >
                      <span className={startDate ? "text-gray-700" : "text-gray-400"}>
                        {startDate ? format(startDate, "yyyy.MM.dd", { locale: ko }) : "시작일"}
                      </span>
                      <CalendarIcon size={14} className="text-gray-400" />
                    </button>
                    {calendarOpenStart && (
                      <div className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-md">
                        <Calendar mode="single" selected={startDate} onSelect={(d) => { setStartDate(d); setCalendarOpenStart(false); }} />
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-400 shrink-0">~</span>
                  <div ref={endRef} className="relative">
                    <button
                      type="button"
                      onClick={() => { setCalendarOpenEnd((v) => !v); setCalendarOpenStart(false); }}
                      className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm flex items-center gap-2 bg-white focus:outline-none focus:ring-1 focus:ring-gray-300"
                    >
                      <span className={endDate ? "text-gray-700" : "text-gray-400"}>
                        {endDate ? format(endDate, "yyyy.MM.dd", { locale: ko }) : "종료일"}
                      </span>
                      <CalendarIcon size={14} className="text-gray-400" />
                    </button>
                    {calendarOpenEnd && (
                      <div className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-md">
                        <Calendar mode="single" selected={endDate} onSelect={(d) => { setEndDate(d); setCalendarOpenEnd(false); }} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5">
                    <Search size={14} className="text-gray-400 shrink-0" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="제목, 작성자로 검색"
                      className="flex-1 text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 카드 그리드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {filtered.map((r) => (
                  <ReportCard key={r.id} {...r} />
                ))}
                {filtered.length === 0 && (
                  <div className="col-span-full py-16 text-center text-sm text-gray-400">보고서가 없습니다.</div>
                )}
              </div>

              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </>
          )}
        </div>
      </main>
    </RequireMember>
  );
}

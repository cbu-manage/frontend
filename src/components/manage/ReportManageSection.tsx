"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Upload, CalendarIcon, Search } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import ReportCard from "@/components/report/ReportCard";
import Pagination from "@/components/shared/Pagination";
import { reportApi, type ReportPreviewItem } from "@/api";

const PAGE_SIZE = 9;

/** 서버 필터용 날짜 포맷 (yyyy-MM-dd) */
function toApiDate(d?: Date): string | undefined {
  return d ? format(d, "yyyy-MM-dd") : undefined;
}

export default function ReportManageSection() {
  const router = useRouter();
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
  const [submittedKeyword, setSubmittedKeyword] = useState("");
  const [groupByTeam, setGroupByTeam] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageIndex = currentPage - 1;
  const resetPage = () => setCurrentPage(1);

  // 검색 실행 (Enter 또는 아이콘 클릭) — 입력값 확정 + 1페이지로
  const runSearch = () => {
    setSubmittedKeyword(search.trim());
    setCurrentPage(1);
  };

  const apiStart = toApiDate(startDate);
  const apiEnd = toApiDate(endDate);
  const keyword = submittedKeyword || undefined;

  // 관리자는 role 기준으로 전체 보고서가 내려옴 / 기간·검색 모두 서버 필터
  const { data: res, isLoading, isError } = useQuery({
    queryKey: ["reports", "manage", pageIndex, apiStart, apiEnd, keyword],
    queryFn: () =>
      reportApi.getList({ page: pageIndex, size: PAGE_SIZE, startDate: apiStart, endDate: apiEnd, keyword }),
  });

  const reportPage = res?.data?.data?.reports;
  const reports: ReportPreviewItem[] = reportPage?.content ?? [];
  const totalPagesCount = Math.max(1, reportPage?.page?.totalPages ?? 1);
  const totalPages = Array.from({ length: totalPagesCount }, (_, i) => i + 1);

  // TODO(백엔드): GET /report에 그룹(팀) 필터 파라미터(예: groupId)가 추가되면
  // 아래 클라이언트 그룹핑을 제거하고 서버 필터+페이지네이션으로 전환할 것.
  // 현재는 서버 필터 없이 "현재 페이지에 받아온 reports"만 groupName으로 묶어서 보여주므로,
  // 한 팀의 보고서가 PAGE_SIZE(9)개를 넘으면 페이지 밖에 있는 나머지는 그룹핑 화면에 안 보임.
  // "팀으로 그룹핑" 토글 시 groupName별로 묶기 (현재 페이지 기준)
  const grouped = reports.reduce<Record<string, ReportPreviewItem[]>>(
    (acc, r) => {
      (acc[r.groupName] ??= []).push(r);
      return acc;
    },
    {},
  );

  const renderCard = (r: ReportPreviewItem) => (
    <ReportCard
      key={r.postId}
      id={r.postId}
      tag={r.groupName}
      title={r.title}
      author={r.authorName}
      generation={r.generation}
      date={r.date}
    />
  );

  return (
    <div className="max-w-6xl mx-auto">

      {/* 헤더: 제목 + 업로드 버튼 */}
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-h1 text-gray-900">전체 보고서 관리</h1>
        <button
          onClick={() => router.push("/report/write")}
          className="px-6 py-3 bg-gray-800 text-white rounded-2xl font-medium text-base hover:bg-[#3E434A]/90 transition-colors flex items-center gap-4 shrink-0 whitespace-nowrap tracking-wide"
        >
          <Upload size={18} />
          새 보고서 업로드
        </button>
      </div>

      {/* 필터 영역: 기간(활동일) + 검색 + 팀으로 그룹핑 */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 mb-6 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0">
            <span className="font-medium text-gray-700 shrink-0 w-8">기간</span>
            <div ref={startRef} className="relative">
              <button
                type="button"
                onClick={() => { setCalendarOpenStart((v) => !v); setCalendarOpenEnd(false); }}
                aria-haspopup="dialog"
                aria-expanded={calendarOpenStart}
                aria-label="시작일 선택"
                className="w-40 border border-gray-200 rounded-lg px-3 py-1.5 text-sm flex items-center justify-between bg-white focus:outline-none focus:ring-2 focus:ring-report-ring"
              >
                <span className={startDate ? "text-gray-700" : "text-gray-400"}>
                  {startDate ? format(startDate, "yyyy.MM.dd", { locale: ko }) : "시작일"}
                </span>
                <CalendarIcon size={14} className="text-gray-400" />
              </button>
              {calendarOpenStart && (
                <div className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-md">
                  <Calendar mode="single" selected={startDate} onSelect={(d) => { setStartDate(d); setCalendarOpenStart(false); resetPage(); }} />
                </div>
              )}
            </div>
            <span className="shrink-0">~</span>
            <div ref={endRef} className="relative">
              <button
                type="button"
                onClick={() => { setCalendarOpenEnd((v) => !v); setCalendarOpenStart(false); }}
                aria-haspopup="dialog"
                aria-expanded={calendarOpenEnd}
                aria-label="종료일 선택"
                className="w-40 border border-gray-200 rounded-lg px-3 py-1.5 text-sm flex items-center justify-between bg-white focus:outline-none focus:ring-2 focus:ring-report-ring"
              >
                <span className={endDate ? "text-gray-700" : "text-gray-400"}>
                  {endDate ? format(endDate, "yyyy.MM.dd", { locale: ko }) : "종료일"}
                </span>
                <CalendarIcon size={14} className="text-gray-400" />
              </button>
              {calendarOpenEnd && (
                <div className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-md">
                  <Calendar mode="single" selected={endDate} onSelect={(d) => { setEndDate(d); setCalendarOpenEnd(false); resetPage(); }} />
                </div>
              )}
            </div>
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => { setStartDate(undefined); setEndDate(undefined); resetPage(); }}
                className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
              >
                초기화
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm text-gray-600">팀으로 그룹핑</span>
            <button
              type="button"
              role="switch"
              aria-checked={groupByTeam}
              aria-label="팀으로 그룹핑"
              onClick={() => setGroupByTeam((v) => !v)}
              className={`relative w-10 h-6 rounded-full transition-colors ${
                groupByTeam ? "bg-gray-800" : "bg-gray-200"
              }`}
            >
              <span
                className={`absolute left-0 top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  groupByTeam ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* 검색 (서버 keyword — 제목·작성자) · Enter 또는 아이콘 클릭으로 검색 */}
        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5">
          <button
            type="button"
            onClick={runSearch}
            aria-label="검색"
            className="shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
          >
            <Search size={15} />
          </button>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") runSearch(); }}
            placeholder="제목, 작성자로 검색"
            aria-label="제목·작성자 검색"
            className="flex-1 text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
          />
        </div>
      </div>

      {/* 상태 표시 */}
      {isLoading && (
        <div className="text-center py-16 text-gray-500">불러오는 중...</div>
      )}
      {isError && (
        <div className="text-center py-16 text-red-500">보고서를 불러오지 못했습니다.</div>
      )}

      {!isLoading && !isError && (
        <>
          {reports.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-400">보고서가 없습니다.</div>
          ) : groupByTeam ? (
            /* 팀(그룹)별 묶음 보기 */
            <div className="space-y-8 mb-6">
              {Object.entries(grouped).map(([groupName, items]) => (
                <div key={groupName}>
                  <h2 className="text-sm font-semibold text-gray-700 mb-3">{groupName}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {items.map(renderCard)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* 평면 그리드 */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
              {reports.map(renderCard)}
            </div>
          )}

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      )}

    </div>
  );
}

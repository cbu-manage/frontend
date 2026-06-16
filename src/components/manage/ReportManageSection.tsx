"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Upload, Search } from "lucide-react";
import ReportCard from "@/components/report/ReportCard";
import Pagination from "@/components/shared/Pagination";
import { reportApi, type ReportPreviewItem } from "@/api";

const PAGE_SIZE = 9;

function formatDate(iso: string): string {
  try {
    return format(new Date(iso), "MM.dd");
  } catch {
    return iso;
  }
}

/** createdAt(ISO)이 start~end(YYYY-MM-DD 문자열) 범위에 드는지 */
function inDateRange(iso: string, start: string, end: string): boolean {
  const d = iso.slice(0, 10); // "YYYY-MM-DD"
  if (start && d < start) return false;
  if (end && d > end) return false;
  return true;
}

export default function ReportManageSection() {
  const router = useRouter();
  const [team, setTeam] = useState("전체");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");
  const [groupByTeam, setGroupByTeam] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageIndex = currentPage - 1;

  const { data: res, isLoading, isError } = useQuery({
    queryKey: ["reports", "manage", pageIndex],
    queryFn: () => reportApi.getList({ page: pageIndex, size: PAGE_SIZE }),
  });

  const reportPage = res?.data?.data;
  const reports: ReportPreviewItem[] = reportPage?.content ?? [];
  const totalPagesCount = Math.max(1, reportPage?.totalPages ?? 1);
  const totalPages = Array.from({ length: totalPagesCount }, (_, i) => i + 1);

  // 팀(그룹) 탭 — 실제 응답의 groupName으로 구성
  const teamTabs = ["전체", ...Array.from(new Set(reports.map((r) => r.groupName)))];

  const filtered = reports.filter((r) => {
    const matchTeam = team === "전체" || r.groupName === team;
    const matchSearch =
      r.title.includes(search) || r.authorName.includes(search);
    const matchDate = inDateRange(r.createdAt, startDate, endDate);
    return matchTeam && matchSearch && matchDate;
  });

  // "팀으로 그룹핑" 토글 시 groupName별로 묶기
  const grouped = filtered.reduce<Record<string, ReportPreviewItem[]>>(
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
      date={formatDate(r.createdAt)}
    />
  );

  return (
    <div className="max-w-6xl mx-auto">

      {/* 헤더: 제목 + 업로드 버튼 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-h1 text-gray-900">전체 보고서 관리</h1>
        <button
          onClick={() => router.push("/report/write")}
          className="px-6 py-3 bg-gray-800 text-white rounded-2xl font-medium text-base hover:bg-[#3E434A]/90 transition-colors flex items-center gap-4 shrink-0 whitespace-nowrap tracking-wide"
        >
          <Upload size={18} />
          새 보고서 업로드
        </button>
      </div>

      {/* 필터 영역 */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 mb-6 space-y-3">

        {/* 팀 탭 */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-gray-700 shrink-0 w-8">팀</span>
          {teamTabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTeam(t)}
              className={
                team === t
                  ? "px-3 py-1 rounded-full text-sm font-medium bg-gray-800 text-white transition-colors"
                  : "px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
              }
            >
              {t}
            </button>
          ))}
        </div>

        {/* 기간 + 팀으로 그룹핑 */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0">
            <span className="font-medium text-gray-700 shrink-0 w-8">기간</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              aria-label="시작일"
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
            <span className="shrink-0">~</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              aria-label="종료일"
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
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

        {/* 검색 */}
        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="제목, 작성자로 검색"
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
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-400">보고서가 없습니다.</div>
          ) : groupByTeam ? (
            /* 팀(그룹)별 묶음 보기 */
            <div className="space-y-8 mb-6">
              {Object.entries(grouped).map(([groupName, items]) => (
                <div key={groupName}>
                  <h2 className="text-sm font-semibold text-gray-700 mb-3">{groupName}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map(renderCard)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* 평면 그리드 */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {filtered.map(renderCard)}
            </div>
          )}

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      )}

    </div>
  );
}

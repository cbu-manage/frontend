"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Search } from "lucide-react";
import ReportCard from "@/components/report/ReportCard";

const TEAM_TABS = ["전체", "프론트엔드", "백엔드", "기획", "디자인"] as const;
type Team = (typeof TEAM_TABS)[number];

// TODO: API 연동 후 실제 데이터로 교체
const MOCK_REPORTS = [
  {
    id: 1,
    tag: "프론트엔드팀",
    title: "2026년 4월 정기활동 보고서",
    author: "15기 김민주",
    date: "04.18",
    files: ["HWP", "PDF"], // 첨부 파일 형식 (추후 다운로드 링크로 교체)
  },
  {
    id: 2,
    tag: "프론트엔드팀",
    title: "3월 스프린트 회고",
    author: "15기 나도현",
    date: "03.31",
    files: ["HWP", "PDF"],
  },
  {
    id: 3,
    tag: "백엔드팀",
    title: "API v2 릴리즈 보고서",
    author: "14기 이서연",
    date: "04.14",
    files: ["HWP", "PDF"],
  },
  {
    id: 4,
    tag: "백엔드팀",
    title: "3월 정기활동 보고서",
    author: "14기 최준호",
    date: "03.30",
    files: ["HWP", "PDF"],
  },
  {
    id: 5,
    tag: "기획팀",
    title: "4월 유저 인터뷰 결과",
    author: "15기 정재준",
    date: "04.12",
    files: ["HWP", "PDF"],
  },
  {
    id: 6,
    tag: "디자인팀",
    title: "디자인 시스템 v1.2",
    author: "14기 공도식",
    date: "04.09",
    files: ["HWP", "PDF"],
  },
];

export default function ReportManageSection() {
  const router = useRouter();
  const [team, setTeam] = useState<Team>("전체");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");
  const [groupByTeam, setGroupByTeam] = useState(false);

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
        <div className="flex items-center gap-2">
          {TEAM_TABS.map((t) => (
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
            <span className="font-medium text-gray-700 shrink-0">기간</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outligne-none focus:ring-1 focus:ring-gray-300"
            />
            <span className="shrink-0">~</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm text-gray-600">팀으로 그룹핑</span>
            <button
              type="button"
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

      {/* 보고서 카드 그리드: 1열(모바일) → 2열(태블릿) → 3열(데스크탑) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {MOCK_REPORTS.map((report) => (
          <ReportCard key={report.id} {...report} />
        ))}
      </div>

    </div>
  );
}

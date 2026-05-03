"use client";

import Link from "next/link";
import { Upload } from "lucide-react";

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
  return (
    <div className="max-w-6xl mx-auto">

      {/* 헤더: 제목 + 업로드 버튼 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-h1 text-gray-900">보고서 관리</h1>
        {/* TODO: 클릭 시 업로드 모달 or 페이지 이동 연결 */}
        <button className="px-6 py-3 bg-gray-800 text-white rounded-2xl font-medium text-base hover:bg-[#3E434A]/90 transition-colors flex items-center gap-4 shrink-0 whitespace-nowrap tracking-wide">
          <Upload size={18} />
          새 보고서 업로드
        </button>
      </div>

      {/* 필터 영역: 팀/기간/검색 필터 - TODO: 추후 구현 */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 mb-6 h-28" />

      {/* 보고서 카드 그리드: 1열(모바일) → 2열(태블릿) → 3열(데스크탑) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {MOCK_REPORTS.map((report) => (
          // 카드 클릭 시 /manage/reports/{id} 상세 페이지로 이동
          <Link
            key={report.id}
            href={`/manage/reports/${report.id}`}
            className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-shadow min-h-[140px]"
          >
            {/* 팀 뱃지 (좌상단) */}
            <span className="inline-block self-start rounded border border-gray-300 px-2 py-0.5 text-xs font-medium text-gray-700 mb-3">
              {report.tag}
            </span>

            {/* 보고서 제목 */}
            <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
              {report.title}
            </h3>

            {/* 작성자 · 날짜 */}
            <p className="text-xs text-gray-400 mb-4">
              {report.author} · {report.date}
            </p>

            {/* 파일 형식 뱃지 (우하단) - mt-auto로 카드 하단에 고정 */}
            <div className="flex justify-end gap-1 mt-auto">
              {report.files.map((f) => (
                <span
                  key={f}
                  className="rounded border border-gray-200 px-2 py-0.5 text-xs text-gray-500 font-medium"
                >
                  {f}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}

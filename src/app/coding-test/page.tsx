/**
 * @file coding-test/page.tsx
 * @description 코딩테스트 준비 페이지
 *
 * 코딩테스트 문제 풀이 목록을 테이블 형태로 보여주는 페이지입니다.
 * - 필터: 상태(미해결/해결), 언어(Python/Java 등), 플랫폼(프로그래머스/백준 등)
 * - 테이블: 문제 목록 (상태, 문제, 언어, 플랫폼, 작성자, 댓글)
 * - 페이지네이션: 페이지 이동
 *
 * @todo [대기] 실제 API 연동 시 더미 데이터 제거
 * @todo [대기] 모바일 반응형 - 테이블 → 카드 레이아웃 변환 필요
 */

"use client";

import { useState } from "react";
import {
  CodingTestRow,
  SolveStatus,
  Language,
  Platform,
} from "@/components/coding-test/CodingTestRow";
import PGN from "@/components/shared/Pagination";

// ============================================
// 상수 정의
// ============================================

/**
 * 페이지네이션용 페이지 번호 배열
 * @todo 실제 API 연동 시 동적으로 생성
 */
const TOTAL_PAGES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// ============================================
// 더미 데이터
// ============================================

/**
 * 코딩테스트 문제 목록 더미 데이터
 * @todo 실제 API 연동 시 제거
 */
const PROBLEMS = [
  {
    id: 1,
    status: "미해결" as SolveStatus,
    title: "백준 12865번 ~.평범한 배낭 내용",
    language: "Python" as Language,
    platform: "프로그래머스" as Platform,
  },
  {
    id: 2,
    status: "해결" as SolveStatus,
    title: "백준 12865번 ~.평범한 배낭 내용",
    language: "Python" as Language,
    platform: "프로그래머스" as Platform,
  },
  {
    id: 3,
    status: "해결" as SolveStatus,
    title: "백준 12865번 ~.평범한 배낭 내용",
    language: "Python" as Language,
    platform: "프로그래머스" as Platform,
  },
  {
    id: 4,
    status: "미해결" as SolveStatus,
    title: "백준 12865번 ~.평범한 배낭 내용",
    language: "Python" as Language,
    platform: "프로그래머스" as Platform,
  },
  {
    id: 5,
    status: "해결" as SolveStatus,
    title: "백준 12865번 ~.평범한 배낭 내용",
    language: "Python" as Language,
    platform: "프로그래머스" as Platform,
  },
  {
    id: 6,
    status: "해결" as SolveStatus,
    title: "백준 12865번 ~.평범한 배낭 내용",
    language: "Python" as Language,
    platform: "프로그래머스" as Platform,
  },
  {
    id: 7,
    status: "해결" as SolveStatus,
    title: "백준 12865번 ~.평범한 배낭 내용",
    language: "Python" as Language,
    platform: "프로그래머스" as Platform,
  },
  {
    id: 8,
    status: "해결" as SolveStatus,
    title: "백준 12865번 ~.평범한 배낭 내용",
    language: "Python" as Language,
    platform: "프로그래머스" as Platform,
  },
  {
    id: 9,
    status: "미해결" as SolveStatus,
    title: "백준 12865번 ~.평범한 배낭 내용",
    language: "Python" as Language,
    platform: "프로그래머스" as Platform,
  },
  {
    id: 10,
    status: "해결" as SolveStatus,
    title: "백준 12865번 ~.평범한 배낭 내용",
    language: "Python" as Language,
    platform: "프로그래머스" as Platform,
  },
  {
    id: 11,
    status: "해결" as SolveStatus,
    title: "백준 12865번 ~.평범한 배낭 내용",
    language: "Python" as Language,
    platform: "프로그래머스" as Platform,
  },
  {
    id: 12,
    status: "해결" as SolveStatus,
    title: "백준 12865번 ~.평범한 배낭 내용",
    language: "Python" as Language,
    platform: "프로그래머스" as Platform,
  },
];

// ============================================
// FilterButton 컴포넌트
// ============================================

/**
 * FilterButton Props 인터페이스
 */
interface FilterButtonProps {
  /** 버튼에 표시될 라벨 */
  label: string;
  /** 드롭다운 열림 상태 */
  isOpen: boolean;
  /** 클릭 핸들러 */
  onClick: () => void;
}

/**
 * 필터 드롭다운 버튼 컴포넌트
 *
 * @param props - FilterButtonProps
 * @returns 필터 버튼 JSX 요소
 */
function FilterButton({ label, isOpen, onClick }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className="
        inline-flex items-center gap-2
        px-4 py-2
        bg-[#EEEFF3]/80 hover:bg-[#EEEFF3]
        rounded-xl
        text-base font-semibold text-gray-900
        transition-colors
      "
    >
      {label}
      {/* 드롭다운 화살표 아이콘 */}
      <svg
        className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
        fill="none"
        stroke="#959AA3"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
  );
}

interface SelectedFilterChipProps {
  label: string;
  onClear: () => void;
}

// 선택된 필터를 보여주는 칩 컴포넌트 (X 아이콘으로 해제 가능)
function SelectedFilterChip({ label, onClear }: SelectedFilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClear}
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#DBFAC8] hover:bg-[#c5f2ae] transition-colors"
    >
      <span className="text-sm font-medium text-[#50A219]">{label}</span>
      <span
        className="flex items-center justify-center w-3 h-3 rounded-full text-[#50A219] text-[15px] leading-none"
        aria-hidden="true"
      >
        ✕
      </span>
    </button>
  );
}

// ============================================
// CodingTestPage 컴포넌트
// ============================================

/**
 * 코딩테스트 준비 페이지 컴포넌트
 *
 * @returns 코딩테스트 준비 페이지 JSX 요소
 */
export default function CodingTestPage() {
  // ========== 상태 관리 ==========

  /** 현재 페이지 번호 */
  const [currentPage, setCurrentPage] = useState(1);

  /** 상태 필터 (전체/미해결/해결) */
  const [statusFilter, setStatusFilter] = useState<string>("전체");

  /** 언어 필터 (전체/Python/Java 등) */
  const [languageFilter, setLanguageFilter] = useState<string>("전체");

  /** 플랫폼 필터 (전체/프로그래머스/백준 등) */
  const [platformFilter, setPlatformFilter] = useState<string>("전체");

  /** 현재 열린 필터 드롭다운 */
  const [openFilter, setOpenFilter] = useState<string | null>(null);

  // ========== 이벤트 핸들러 ==========

  /**
   * 필터 드롭다운 토글
   * @param filter - 토글할 필터 이름
   */
  const toggleFilter = (filter: string) => {
    setOpenFilter(openFilter === filter ? null : filter);
  };

  // ========== 필터링 로직 ==========

  /**
   * 필터 조건에 맞는 문제 목록
   */
  const filteredProblems = PROBLEMS.filter((problem) => {
    const statusMatch =
      statusFilter === "전체" || problem.status === statusFilter;
    const languageMatch =
      languageFilter === "전체" || problem.language === languageFilter;
    const platformMatch =
      platformFilter === "전체" || problem.platform === platformFilter;
    return statusMatch && languageMatch && platformMatch;
  });

  return (
    // 페이지 컨테이너 - 전체 화면 배경색
    <div className="w-full bg-gray-0 min-h-screen">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-16">
        {/* ========== 페이지 헤더 ========== */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
          코딩테스트 준비
        </h1>

        {/* ========== 필터 영역 ========== */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
          {/* 상태 필터 드롭다운 */}
          <div className="relative">
            <FilterButton
              label="상태"
              isOpen={openFilter === "status"}
              onClick={() => toggleFilter("status")}
            />
            {openFilter === "status" && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[100px] sm:min-w-[120px]">
                {["전체", "미해결", "해결"].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setStatusFilter(option);
                      setOpenFilter(null);
                    }}
                    className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 언어 필터 드롭다운 */}
          <div className="relative">
            <FilterButton
              label="언어"
              isOpen={openFilter === "language"}
              onClick={() => toggleFilter("language")}
            />
            {openFilter === "language" && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[100px] sm:min-w-[120px]">
                {["전체", "Python", "Java", "C++", "JavaScript", "C"].map(
                  (option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setLanguageFilter(option);
                        setOpenFilter(null);
                      }}
                      className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {option}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>

          {/* 플랫폼 필터 드롭다운 */}
          <div className="relative">
            <FilterButton
              label="플랫폼"
              isOpen={openFilter === "platform"}
              onClick={() => toggleFilter("platform")}
            />
            {openFilter === "platform" && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px] sm:min-w-[140px]">
                {["전체", "프로그래머스", "백준", "LeetCode"].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setPlatformFilter(option);
                      setOpenFilter(null);
                    }}
                    className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 선택된 필터 표시 영역 */}
        {(statusFilter !== "전체" ||
          languageFilter !== "전체" ||
          platformFilter !== "전체") && (
          <div className="flex flex-wrap gap-2 mb-6">
            {statusFilter !== "전체" && (
              <SelectedFilterChip
                label={statusFilter}
                onClear={() => setStatusFilter("전체")}
              />
            )}
            {languageFilter !== "전체" && (
              <SelectedFilterChip
                label={languageFilter}
                onClear={() => setLanguageFilter("전체")}
              />
            )}
            {platformFilter !== "전체" && (
              <SelectedFilterChip
                label={platformFilter}
                onClear={() => setPlatformFilter("전체")}
              />
            )}
          </div>
        )}

        {/* ========== 테이블 영역 ========== */}
        {/*
          모바일에서 가로 스크롤 지원
          @todo [대기] 모바일에서 카드 레이아웃으로 변경 필요
        */}
        <div className="bg-white  border border-gray-200 overflow-x-auto">
          <table className="w-full min-w-[600px]">
            {/* 테이블 헤더 - 초록색 배경 */}
            <thead className="bg-[#95C674] text-white">
              <tr>
                <th className="py-2 sm:py-3 px-2 sm:px-4 text-center text-xs sm:text-sm font-medium w-[80px] sm:w-[100px]">
                  상태
                </th>
                <th className="py-2 sm:py-3 px-2 sm:px-4 text-center text-xs sm:text-sm font-medium">
                  문제
                </th>
                <th className="py-2 sm:py-3 px-2 sm:px-4 text-center text-xs sm:text-sm font-medium w-[70px] sm:w-[100px]">
                  언어
                </th>
                <th className="py-2 sm:py-3 px-2 sm:px-4 text-center text-xs sm:text-sm font-medium w-[90px] sm:w-[120px]">
                  플랫폼
                </th>
                <th className="py-2 sm:py-3 px-2 sm:px-4 text-center text-xs sm:text-sm font-medium w-[90px] sm:w-[120px]">
                  작성자
                </th>
                <th className="py-2 sm:py-3 px-2 sm:px-4 text-center text-xs sm:text-sm font-medium w-[60px] sm:w-[80px]"></th>
              </tr>
            </thead>

            {/* 테이블 바디 */}
            <tbody>
              {filteredProblems.map((problem) => (
                <CodingTestRow
                  key={problem.id}
                  id={problem.id}
                  status={problem.status}
                  title={problem.title}
                  language={problem.language}
                  platform={problem.platform}
                />
              ))}

              {/* 필터링 결과가 없는 경우 */}
              {filteredProblems.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    해당 조건에 맞는 문제가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ========== 페이지네이션 ========== */}
        <PGN
          currentPage={currentPage}
          totalPages={TOTAL_PAGES}
          onPageChange={(num) => setCurrentPage(num)}
        />
      </main>
    </div>
  );
}

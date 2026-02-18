/**
 * @file project/page.tsx
 * @description 프로젝트 모집 페이지
 *
 * 프로젝트 모집 공고를 리스트 형태로 보여주는 페이지입니다.
 * - 사이드바: 포지션별 카테고리 필터
 * - 상단 탭: 모집 중 / 모집 완료 필터
 * - 프로젝트 리스트: 필터링된 프로젝트 목록 (가로형 카드)
 * - 페이지네이션: 페이지 이동
 *
 * @todo [대기] 모바일 반응형 - 사이드바 숨김 처리 및 카드 레이아웃 변경 필요
 */

"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import Sidebar from "@/components/shared/Sidebar";
import PGN from "@/components/shared/Pagination";
import { ProjectCard, ProjectStatus } from "@/components/project/ProjectCard";

// ============================================
// 상수 정의
// ============================================

/**
 * 사이드바 포지션 목록
 * 직군/역할별 필터
 */
const POSITIONS = [
  { label: "전체", value: "전체" },
  { label: "프론트엔드", value: "프론트엔드" },
  { label: "백엔드", value: "백엔드" },
  { label: "개발", value: "개발" },
  { label: "디자인", value: "디자인" },
  { label: "기획", value: "기획" },
  { label: "기타", value: "기타" },
];

/**
 * 페이지네이션용 페이지 번호 배열
 * @todo 실제 API 연동 시 동적으로 생성
 */
const TOTAL_PAGES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// ============================================
// 더미 데이터
// ============================================

/**
 * 프로젝트 목록 더미 데이터
 * @todo 실제 API 연동 시 제거
 */
const PROJECTS = [
  {
    id: 1,
    status: "모집 중" as ProjectStatus,
    positions: ["프론트엔드", "백엔드", "개발", "디자인", "기획", "기타"],
    title: "[앱 프론트엔드 개발자 모집] 대학생을 위한 중개 플랫폼",
  },
  {
    id: 2,
    status: "모집 완료" as ProjectStatus,
    positions: ["프론트엔드", "백엔드", "개발", "디자인", "기획"],
    title: "[백엔드 개발자 모집] Spring Boot 기반 서버 개발",
  },
  {
    id: 3,
    status: "모집 중" as ProjectStatus,
    positions: ["프론트엔드", "백엔드", "개발", "디자인"],
    title: "[UI/UX 디자이너 모집] 모바일 앱 디자인",
  },
  {
    id: 4,
    status: "모집 중" as ProjectStatus,
    positions: ["프론트엔드", "백엔드", "개발"],
    title: "[서비스 기획자 모집] 신규 서비스 기획",
  },
  {
    id: 5,
    status: "모집 완료" as ProjectStatus,
    positions: ["프론트엔드", "백엔드"],
    title: "[풀스택 개발자 모집] 사이드 프로젝트",
  },
  {
    id: 6,
    status: "모집 중" as ProjectStatus,
    positions: ["프론트엔드"],
    title: "[마케터 모집] SNS 마케팅 담당",
  },
  {
    id: 7,
    status: "모집 중" as ProjectStatus,
    positions: ["프론트엔드", "백엔드", "개발"],
    title: "[React 개발자 모집] 웹 서비스 개발",
  },
  {
    id: 8,
    status: "모집 중" as ProjectStatus,
    positions: ["백엔드", "개발"],
    title: "[Node.js 개발자 모집] API 서버 구축",
  },
];

// ============================================
// ProjectPage 컴포넌트
// ============================================

/**
 * 프로젝트 모집 페이지 컴포넌트
 *
 * @returns 프로젝트 모집 페이지 JSX 요소
 */
export default function ProjectPage() {
  // ========== 상태 관리 ==========

  /** 현재 선택된 포지션 (사이드바) */
  const [selectedPosition, setSelectedPosition] = useState("전체");

  /** 현재 선택된 모집 상태 (상단 탭) */
  const [statusFilter, setStatusFilter] = useState<ProjectStatus>("모집 중");

  /** 현재 페이지 번호 */
  const [currentPage, setCurrentPage] = useState(1);

  // ========== 필터링 로직 ==========

  /**
   * 포지션 + 모집 상태로 필터링된 프로젝트 목록
   */
  const filteredProjects = PROJECTS.filter((project) => {
    // 포지션 필터: '전체'가 아닌 경우 해당 포지션을 포함한 프로젝트만 표시
    const positionMatch =
      selectedPosition === "전체" ||
      project.positions.includes(selectedPosition);

    // 모집 상태 필터
    const statusMatch = project.status === statusFilter;

    return positionMatch && statusMatch;
  });

  return (
    <main className="min-h-screen bg-[#F8FAFF]">
      <div className="flex">
        <Sidebar
          items={POSITIONS}
          selected={selectedPosition}
          onSelect={setSelectedPosition}
          writeLink="/project/write"
        />

        {/* 고정 사이드바(w-80) 오른쪽으로 컨텐츠를 밀기 위해 ml-80 사용 */}
        <div className="flex-1 ml-80 pl-16 pr-16 py-16">
          <div className="max-w-6xl mx-auto">
            {/* ========== 페이지 헤더 ========== */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              {/* 제목 */}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                프로젝트 모집 공고
              </h1>

              {/* 나의 작성 목록 버튼 - pill 스타일
            <span className="
              text-sm text-emerald-600
              bg-white border border-emerald-500
              rounded-full px-4 py-1
              cursor-pointer hover:bg-emerald-50
              w-fit
            ">
              나의 작성 목록 &gt;
            </span> */}
            </div>

            {/* ========== 모집 상태 필터 탭 ========== */}
            <div className="flex items-center gap-3 mb-6 text-sm">
              {/* 모집 중 버튼 */}
              <button
                onClick={() => {
                  // isRecruiting = true → 콘솔에 찍지 않음 (요구사항)
                  setStatusFilter("모집 중");
                }}
                className={`flex items-center gap-1 transition-colors ${
                  statusFilter === "모집 중"
                    ? "text-gray-900 font-medium" // 선택됨
                    : "text-gray-400" // 선택 안됨
                }`}
              >
                {/* 체크 아이콘 - 선택된 경우에만 표시 */}
                {statusFilter === "모집 중" && (
                  <Check className="w-4 h-4" />
                )}
                모집 중
              </button>

              {/* 구분선 */}
              <span className="text-gray-300">|</span>

              {/* 모집 완료 버튼 */}
              <button
                onClick={() => {
                  // isRecruiting = false → 콘솔에 찍음 (요구사항)
                  const isRecruiting = false;
                  console.log(`[모집 상태 필터] isRecruiting: ${isRecruiting}`);
                  setStatusFilter("모집 완료");
                }}
                className={`flex items-center gap-1 transition-colors ${
                  statusFilter === "모집 완료"
                    ? "text-gray-900 font-medium" // 선택됨
                    : "text-gray-400" // 선택 안됨
                }`}
              >
                {/* 체크 아이콘 - 선택된 경우에만 표시 */}
                {statusFilter === "모집 완료" && (
                  <Check className="w-4 h-4" />
                )}
                모집 완료
              </button>
            </div>

            {/* ========== 프로젝트 리스트 ========== */}
            <div className="flex flex-col gap-4">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  status={project.status}
                  positions={project.positions}
                  title={project.title}
                />
              ))}

              {/* 필터링 결과가 없는 경우 */}
              {filteredProjects.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  해당 조건에 맞는 프로젝트가 없습니다.
                </div>
              )}
            </div>

            {/* ========== 페이지네이션 ========== */}
            <PGN
              currentPage={currentPage}
              totalPages={TOTAL_PAGES}
              onPageChange={(num) => setCurrentPage(num)}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

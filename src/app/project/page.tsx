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

'use client';

import { useState } from 'react';
import Sidebar from '@/components/shared/Sidebar';
import PGN from '@/components/shared/Pagination';

// ============================================
// 타입 정의
// ============================================

/**
 * 프로젝트 모집 상태 타입
 * - '모집 중': 초록색 배지
 * - '모집 완료': 빨간색 배지
 */
export type ProjectStatus = '모집 중' | '모집 완료';

// ============================================
// 상수 정의
// ============================================

/**
 * 사이드바 포지션 목록
 * 직군/역할별 필터
 */
const POSITIONS = [
  { label: '전체', value: '전체' },
  { label: '프론트엔드', value: '프론트엔드' },
  { label: '백엔드', value: '백엔드' },
  { label: '개발', value: '개발' },
  { label: '디자인', value: '디자인' },
  { label: '기획', value: '기획' },
  { label: '기타', value: '기타' },
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
  { id: 1, status: '모집 중' as ProjectStatus, position: '프론트엔드', title: '[앱 프론트엔드 개발자 모집] 대학생을 위한 중개 플랫폼' },
  { id: 2, status: '모집 완료' as ProjectStatus, position: '백엔드', title: '[백엔드 개발자 모집] Spring Boot 기반 서버 개발' },
  { id: 3, status: '모집 중' as ProjectStatus, position: '디자인', title: '[UI/UX 디자이너 모집] 모바일 앱 디자인' },
  { id: 4, status: '모집 중' as ProjectStatus, position: '기획', title: '[서비스 기획자 모집] 신규 서비스 기획' },
  { id: 5, status: '모집 완료' as ProjectStatus, position: '개발', title: '[풀스택 개발자 모집] 사이드 프로젝트' },
  { id: 6, status: '모집 중' as ProjectStatus, position: '기타', title: '[마케터 모집] SNS 마케팅 담당' },
  { id: 7, status: '모집 중' as ProjectStatus, position: '프론트엔드', title: '[React 개발자 모집] 웹 서비스 개발' },
  { id: 8, status: '모집 중' as ProjectStatus, position: '백엔드', title: '[Node.js 개발자 모집] API 서버 구축' },
];

// ============================================
// 포지션별 색상 매핑
// ============================================

/**
 * 포지션별 태그 색상 정의
 * Tailwind CSS 클래스를 사용합니다.
 */
const POSITION_COLORS: Record<string, string> = {
  '프론트엔드': 'bg-yellow-100 text-yellow-700',
  '백엔드': 'bg-green-100 text-green-700',
  '개발': 'bg-blue-100 text-blue-700',
  '디자인': 'bg-purple-100 text-purple-700',
  '기획': 'bg-orange-100 text-orange-700',
  '기타': 'bg-red-100 text-red-700',
};

// ============================================
// ProjectCard 컴포넌트
// ============================================

/**
 * ProjectCard Props 인터페이스
 */
interface ProjectCardProps {
  /** 모집 상태 */
  status?: ProjectStatus;
  /** 프로젝트 제목 */
  title?: string;
  /** 모집 포지션 */
  position?: string;
  /** 작성자 닉네임 */
  author?: string;
  /** 조회수 */
  views?: number;
  /** 댓글 수 */
  comments?: number;
  /** 작성 시간 */
  time?: string;
}

/**
 * 프로젝트 카드 컴포넌트 (가로형)
 *
 * 스터디 카드와 달리 가로형 레이아웃을 사용합니다.
 * - 왼쪽: 모집 상태 + 제목 (세로 배치)
 * - 오른쪽: 포지션, 작성자, 조회수, 댓글, 시간 (가로 배치)
 *
 * @param props - ProjectCardProps
 * @returns 프로젝트 카드 JSX 요소
 */
function ProjectCard({
  status = '모집 중',
  title = '[앱 프론트엔드 개발자 모집] 대학생을 위한 중개 플랫폼',
  position = '프론트엔드',
  author = 'aBCDFEFGOL',
  views = 122,
  comments = 333,
  time = '6시간 전',
}: ProjectCardProps) {
  // 모집 완료 여부에 따라 배지 색상 결정
  const isCompleted = status === '모집 완료';

  // 포지션 색상 가져오기 (없으면 기본 회색)
  const positionColor = POSITION_COLORS[position] || 'bg-gray-100 text-gray-700';

  return (
    // 카드 컨테이너 - 가로형 레이아웃
    <div className="
      bg-white rounded-2xl border border-gray-200
      px-4 sm:px-6 py-4
      min-h-[90px]
      flex flex-col sm:flex-row sm:items-center sm:justify-between
      gap-4 sm:gap-0
      hover:shadow-md transition-shadow cursor-pointer
    ">
      {/* ========== 왼쪽: 모집 상태 + 제목 (세로 배치) ========== */}
      <div className="flex flex-col gap-2">
        {/* 모집 상태 배지 */}
        <span className={`px-2 py-1 rounded text-xs font-bold w-fit ${
          isCompleted
            ? 'bg-red-50 text-red-500'      // 모집 완료: 빨간색
            : 'bg-emerald-50 text-emerald-500' // 모집 중: 초록색
        }`}>
          {status}
        </span>
        {/* 프로젝트 제목 */}
        <h3 className="text-sm font-bold text-gray-900 line-clamp-2">{title}</h3>
      </div>

      {/* ========== 오른쪽: 메타 정보 (가로 배치) ========== */}
      {/*
        @todo [대기] 모바일에서는 세로 배치 또는 일부 정보 숨김
        현재: sm 이상에서 가로 배치
      */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-5">
        {/* 포지션 태그 */}
        <span className={`${positionColor} px-2 py-1 rounded text-[10px] font-semibold`}>
          {position}
        </span>

        {/* 작성자 정보 */}
        <div className="flex items-center gap-2">
          {/* 프로필 이미지 플레이스홀더 */}
          <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
          <span className="text-gray-600 text-xs">{author}</span>
        </div>

        {/* 조회수 */}
        <span className="text-xs text-gray-400">👁️ {views}</span>

        {/* 댓글 수 */}
        <span className="text-xs text-gray-400">💬 {comments}</span>

        {/* 작성 시간 */}
        <span className="text-xs text-gray-400">🕑 {time}</span>
      </div>
    </div>
  );
}

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
  const [selectedPosition, setSelectedPosition] = useState('전체');

  /** 현재 선택된 모집 상태 (상단 탭) */
  const [statusFilter, setStatusFilter] = useState<ProjectStatus>('모집 중');

  /** 현재 페이지 번호 */
  const [currentPage, setCurrentPage] = useState(1);

  // ========== 필터링 로직 ==========

  /**
   * 포지션 + 모집 상태로 필터링된 프로젝트 목록
   */
  const filteredProjects = PROJECTS.filter((project) => {
    // 포지션 필터: '전체'가 아닌 경우 해당 포지션만 표시
    const positionMatch = selectedPosition === '전체' || project.position === selectedPosition;

    // 모집 상태 필터
    const statusMatch = project.status === statusFilter;

    return positionMatch && statusMatch;
  });

  return (
    // 페이지 컨테이너 - 전체 화면 배경색
    <div className="w-full bg-gray-50 min-h-screen">

      {/* ========== 사이드바 ========== */}
      {/*
        @todo [대기] 모바일 반응형
        - lg 이상에서만 표시: hidden lg:block
        - 모바일에서는 햄버거 메뉴로 대체
      */}
      <Sidebar
        items={POSITIONS}
        selected={selectedPosition}
        onSelect={setSelectedPosition}
        writeLink="/project/write"
      />

      {/* ========== 메인 콘텐츠 영역 ========== */}
      {/*
        ml-80: 사이드바 너비(320px)만큼 왼쪽 여백
        @todo [대기] 모바일에서는 ml-0으로 변경
        예: className="ml-0 lg:ml-80"
      */}
      <div className="ml-80">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-16">

          {/* ========== 페이지 헤더 ========== */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            {/* 제목 */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">프로젝트 모집 공고</h1>

            {/* 나의 작성 목록 버튼 - pill 스타일 */}
            <span className="
              text-sm text-emerald-600
              bg-white border border-emerald-500
              rounded-full px-4 py-1
              cursor-pointer hover:bg-emerald-50
              w-fit
            ">
              나의 작성 목록 &gt;
            </span>
          </div>

          {/* ========== 모집 상태 필터 탭 ========== */}
          <div className="flex items-center gap-3 mb-6 text-sm">
            {/* 모집 중 버튼 */}
            <button
              onClick={() => {
                // isRecruiting = true → 콘솔에 찍지 않음 (요구사항)
                setStatusFilter('모집 중');
              }}
              className={`flex items-center gap-1 transition-colors ${
                statusFilter === '모집 중'
                  ? 'text-gray-900 font-medium'  // 선택됨
                  : 'text-gray-400'               // 선택 안됨
              }`}
            >
              {/* 체크 아이콘 - 선택된 경우에만 표시 */}
              {statusFilter === '모집 중' && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
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
                setStatusFilter('모집 완료');
              }}
              className={`flex items-center gap-1 transition-colors ${
                statusFilter === '모집 완료'
                  ? 'text-gray-900 font-medium'  // 선택됨
                  : 'text-gray-400'               // 선택 안됨
              }`}
            >
              {/* 체크 아이콘 - 선택된 경우에만 표시 */}
              {statusFilter === '모집 완료' && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              모집 완료
            </button>
          </div>

          {/* ========== 프로젝트 리스트 ========== */}
          <div className="flex flex-col gap-4">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                status={project.status}
                position={project.position}
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
        </main>
      </div>
    </div>
  );
}

/**
 * @file ProjectCard.tsx
 * @description 프로젝트 모집 컴포넌트 모음
 *
 * 프로젝트 모집 페이지에서 사용되는 컴포넌트들을 포함합니다.
 *
 * @origin 통합된 컴포넌트:
 * - ProjectCard (35~159줄): 기존 src/app/project/page.tsx 인라인 컴포넌트에서 이동
 * - ProjectRow (161~277줄): 기존 src/components/project/ProjectRow.tsx에서 이동
 *
 * 공통 요소:
 * - 모집 상태 (모집 중 / 모집 완료)
 * - 프로젝트 제목
 * - 포지션 태그 (프론트엔드/백엔드/디자인 등)
 * - 작성자 정보, 조회수, 댓글 수
 */

'use client';

import Link from 'next/link';
import { MessageCircle, Eye, Clock } from 'lucide-react';

// ============================================
// 타입 정의
// ============================================

/**
 * 프로젝트 모집 상태 타입
 * - '모집 중': 초록색 배지
 * - '모집 완료': 빨간색 배지
 */
export type ProjectStatus = '모집 중' | '모집 완료';

/**
 * 프로젝트 포지션 타입
 * 사이드바 필터와 카드 태그에 사용됩니다.
 */
export type ProjectPosition = '전체' | '프론트엔드' | '백엔드' | '개발' | '디자인' | '기획' | '기타';

/**
 * ProjectCard 컴포넌트 Props 인터페이스
 */
interface ProjectCardProps {
  /** 카드 고유 번호 (key용) */
  id: number;

  /** 모집 상태 */
  status?: ProjectStatus;

  /** 프로젝트 제목 */
  title?: string;

  /** 모집 포지션 배열 */
  positions?: string[];

  /** 작성자 닉네임 */
  author?: string;

  /** 조회수 */
  views?: number;

  /** 댓글 수 */
  comments?: number;

  /** 작성 시간 */
  time?: string;

  /** 프로젝트 내용 (호버 시 미리보기) */
  content?: string;
}

// ============================================
// ProjectCard 컴포넌트
// @origin src/app/project/page.tsx (인라인 → 분리)
// ============================================

/**
 * 프로젝트 모집 카드 컴포넌트 (가로형)
 *
 * 스터디 카드와 달리 가로형 레이아웃을 사용합니다.
 * - 왼쪽: 모집 상태 + 제목
 * - 중앙: 포지션 태그
 * - 오른쪽: 작성자, 조회수, 댓글, 시간
 *
 * @param props - ProjectCardProps
 * @returns 프로젝트 카드 JSX 요소
 *
 * @example
 * <ProjectCard
 *   id={1}
 *   status="모집 중"
 *   title="[프론트엔드 개발자 모집] 웹 서비스 개발"
 *   positions={['프론트엔드', '백엔드']}
 *   author="씨부엉 34기"
 *   views={122}
 *   comments={333}
 *   time="6시간 전"
 * />
 */
export function ProjectCard({
  id,
  status = '모집 중',
  title = '[앱 프론트엔드 개발자 모집] 대학생을 위한 중개 플랫폼',
  positions = ['프론트엔드'],
  author = '씨부엉 34기',
  views = 122,
  comments = 333,
  time = '1/2333',
  content = '안녕하세요!웹/앱 서비스 구현을 목표로 한 사이드 프로젝트를 함께할 팀원을 모집합니다. 📌 프로젝트 개요주제: (예: 일정 관리 웹 서비스 : 기획 → 디자인 → 실제 구현 → 배 : 약 6~8주식: 주 1회 온라인 회의',
}: ProjectCardProps) {
  // 모집 완료 여부에 따라 배지 색상 결정
  const isCompleted = status === '모집 완료';

  return (
    <Link href={`/project/${id}`} className="group bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
      {/* ========== 카드 상단: 모집 상태 + 마감일 + 제목 + 내용 미리보기 ========== */}
      <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 sm:pb-5 flex flex-col gap-3">
        {/* 상단 행: 모집 상태 배지 + 마감일 */}
        <div className="flex justify-between items-center">
          <span className={`w-14 text-center py-1.5 rounded-full text-xs text-white ${
            isCompleted
              ? 'bg-red-400'
              : 'bg-[#6ECA8F]'
          }`}>
            {status}
          </span>
          <span className="bg-gray-100 text-gray-700 text-xs font-medium flex items-center gap-1 px-3 py-1 rounded-full">
            <Clock size={12} />마감일 {time}
          </span>
        </div>

        {/* 프로젝트 제목 */}
        <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug line-clamp-2">
          {title}
        </h3>

        {/* 내용 미리보기 - 호버 시 표시 */}
        {content && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 max-h-0 overflow-hidden opacity-0 -mb-3 group-hover:max-h-20 group-hover:opacity-100 group-hover:mb-0 transition-all duration-300 ease-in-out">
            {content}
          </p>
        )}
      </div>

      {/* ========== 카드 하단: 포지션 태그 + 메타 정보 ========== */}
      <div className="bg-white px-4 sm:px-6 py-4 sm:py-5 border-t border-gray-200 flex justify-between items-center">
        {/* 포지션 태그 */}
        <div className="flex flex-wrap gap-1.5">
          {positions.map((pos) => (
            <span key={pos} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-[10px] font-medium">
              {pos}
            </span>
          ))}
        </div>

        {/* 조회수 + 댓글 수 + 작성자 */}
        <div className="flex items-center gap-12 sm:gap-14 text-xs text-gray-400">
          <span className="flex items-center gap-1"><Eye size={14} /> {views}</span>
          <span className="flex items-center gap-1">
            <MessageCircle size={14} />
            {comments}
          </span>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
            <span className="text-gray-600 text-xs">{author}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ============================================
// ProjectRow 컴포넌트
// @origin src/components/project/ProjectRow.tsx (통합)
// ============================================

/**
 * ProjectRow 컴포넌트 Props 인터페이스
 */
interface ProjectRowProps {
  /** 카드 고유 번호 (key용) */
  id: number;

  /** 모집 상태 */
  status: ProjectStatus;

  /** 모집 포지션 */
  position: ProjectPosition;

  /** 프로젝트 제목 */
  title: string;

  /** 작성자 닉네임 */
  author: string;

  /** 작성 시간 */
  time: string;

  /** 댓글 수 */
  comments?: number;
}

/**
 * 프로젝트 모집 행 컴포넌트 (테이블형)
 *
 * 테이블/리스트 형태의 레이아웃을 사용합니다.
 * - 모바일: 카드형 레이아웃
 * - 태블릿/PC: 그리드형 레이아웃
 *
 * @param props - ProjectRowProps
 * @returns 프로젝트 행 JSX 요소
 *
 * @example
 * <ProjectRow
 *   status="모집 중"
 *   position="프론트엔드"
 *   title="[프론트엔드 개발자 모집] 웹 서비스 개발"
 *   author="씨부엉 34기"
 *   time="6시간 전"
 *   comments={10}
 * />
 */
export function ProjectRow({
  id,
  status,
  position,
  title,
  author,
  time,
  comments,
}: ProjectRowProps) {
  // 모집 완료 여부에 따라 배지 색상 결정
  const isCompleted = status === '모집 완료';

  return (
    <Link href={`/project/${id}`} className="border-b border-gray-100 py-4 hover:bg-gray-50 transition-colors cursor-pointer w-full block">
      {/* ========== 모바일 카드형 (sm 미만) ========== */}
      <div className="flex flex-col gap-3 sm:hidden px-4 w-full">
        {/* 상단: 상태 및 포지션 배지 */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold text-white ${
            isCompleted
              ? 'bg-red-400'      // 모집 완료: 빨강 배경
              : 'bg-[#6ECA8F]'    // 모집 중: 초록 배경
          }`}>
            {status}
          </span>
          <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-[10px] font-semibold">
            {position}
          </span>
        </div>

        {/* 하단: 제목과 작성자/시간 */}
        <div className="flex justify-between items-end gap-4">
          <div className="font-semibold text-gray-800 text-sm leading-snug break-keep">
            {title}
            {comments && (
              <span className="inline-flex items-center ml-1 text-blue-500 text-xs font-normal">
                <MessageCircle size={12} className="mr-0.5" />
                {comments}
              </span>
            )}
          </div>

          {/* 작성자 및 시간 */}
          <div className="flex flex-col items-end flex-shrink-0 gap-1">
            <span className="text-gray-600 text-[11px] font-medium">{author}</span>
            <span className="text-gray-400 text-[10px] font-normal">{time}</span>
          </div>
        </div>
      </div>

      {/* ========== 태블릿/PC 그리드형 (sm 이상) ========== */}
      <div className="hidden sm:grid sm:grid-cols-6 md:grid-cols-10 lg:grid-cols-13 text-center items-center">
        <div className="col-span-1 md:col-span-2">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold text-white inline-block ${
            isCompleted
              ? 'bg-red-400'      // 모집 완료: 빨강 배경
              : 'bg-[#6ECA8F]'    // 모집 중: 초록 배경
          }`}>
            {status}
          </span>
        </div>
        <div className="col-span-2">
          <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-[10px] font-semibold">
            {position}
          </span>
        </div>
        <div className="col-span-3 md:col-span-4 lg:col-span-4 text-left md:text-center px-4 font-semibold text-gray-800 text-sm md:text-base">
          {title}
          {comments && (
            <span className="inline-flex items-center ml-2 text-blue-500 text-xs font-normal">
              <MessageCircle size={14} className="mr-1" />
              {comments}
            </span>
          )}
        </div>
        <div className="hidden md:block md:col-span-2 text-gray-500 text-sm">{author}</div>
        <div className="hidden lg:block lg:col-span-2 text-gray-400 text-sm">{time}</div>
      </div>
    </Link>
  );
}

/**
 * @file StudyCard.tsx
 * @description 스터디 모집 카드 컴포넌트
 *
 * 스터디 모집 페이지에서 각 스터디 정보를 카드 형태로 표시합니다.
 * - 모집 상태 (모집 중 / 모집 완료)
 * - 스터디 제목
 * - 카테고리 태그 (프로그래밍 언어/분야)
 * - 작성자 정보, 조회수, 댓글 수
 */

'use client';

import Link from 'next/link';
import { MessageCircle, Clock, Eye } from 'lucide-react';

// ============================================
// 타입 정의
// ============================================

/**
 * 스터디 카테고리 타입
 * 사이드바 필터와 카드 태그에 사용됩니다.
 *
 * @todo [대기] 중복 카테고리 지원 필요 시 배열 타입으로 변경
 * 예: categories: StudyCategory[] → ['Python', '알고리즘']
 */
export type StudyCategory = '전체' | 'C++' | 'Python' | 'Java' | '알고리즘' | '기타';

/**
 * 스터디 모집 상태 타입
 * - '모집 중': 초록색 배지
 * - '모집 완료': 빨간색 배지
 */
export type StudyStatus = '모집 중' | '모집 완료';

/**
 * StudyCard 컴포넌트 Props 인터페이스
 */
interface StudyCardProps {
  /** 카드 고유 ID (key용) */
  id: number;

  /**
   * 스터디 카테고리 (프로그래밍 언어/분야)
   * @default 'C++'
   * @todo [대기] 중복 카테고리 지원 시 categories: StudyCategory[]로 변경
   */
  category?: StudyCategory;

  /**
   * 모집 상태
   * @default '모집 중'
   */
  status?: StudyStatus;

  /**
   * 스터디 제목
   * @default '웹개발 스터디 모집합니다~'
   */
  title?: string;

  /**
   * 작성 시간
   * @default '6시간 전'
   */
  time?: string;
}

// ============================================
// StudyCard 컴포넌트
// ============================================

/**
 * 스터디 모집 카드 컴포넌트
 *
 * @param props - StudyCardProps
 * @returns 스터디 카드 JSX 요소
 *
 * @example
 * <StudyCard
 *   id={1}
 *   category="Python"
 *   status="모집 중"
 *   title="파이썬 스터디 모집합니다!"
 *   time="3시간 전"
 * />
 */
export function StudyCard({
  id,
  category = 'C++',
  status = '모집 중',
  title = '웹개발 스터디 모집합니다~',
  time = '6시간 전'
}: StudyCardProps) {

  // 모집 완료 여부에 따라 배지 색상 결정
  const isCompleted = status === '모집 완료';

  return (
    // 카드 컨테이너 - 호버 시 그림자 효과
    <Link href={`/study/${id}`} className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col hover:shadow-md transition-shadow cursor-pointer overflow-hidden">

      {/* 카드 상단: 모집 상태, 제목, 카테고리 태그 */}
      <div className="p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 flex-1">

        {/* 상단 행: 모집 상태 배지 + 작성 시간 */}
        <div className="justify-between items-center flex">
          {/* 모집 상태 배지 - 타원형, 고정 너비 */}
          <span className={`w-14 text-center py-1.5 rounded-full text-xs text-white ${
            isCompleted
              ? 'bg-red-400'      // 모집 완료: 빨강 배경
              : 'bg-[#6ECA8F]'  // 모집 중: 초록 배경
          }`}>
            {status}
          </span>

          {/* 작성 시간 */}
          <span className="text-gray-400 text-xs font-light flex items-center gap-0.5"><Clock size={12} />{time}</span>
        </div>

        {/* 중간 영역: 제목 + 카테고리 태그 */}
        <div className="flex flex-col gap-3 sm:gap-4 flex-1">
          {/* 스터디 제목 - 2줄 고정 높이 */}
          <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug line-clamp-2 min-h-[2.75rem] sm:min-h-[3.25rem]">
            {title}
          </h3>

          {/*
            카테고리 태그 영역
            @todo [대기] 중복 카테고리 지원 시 아래와 같이 수정:
            {categories.map((cat) => (
              <span key={cat} className={`${CATEGORY_COLORS[cat].bg} ${CATEGORY_COLORS[cat].text} ...`}>
                {cat}
              </span>
            ))}
          */}
          <div className="flex flex-wrap gap-1.5">
            <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-[10px] font-semibold">C++</span>
            <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-[10px] font-semibold">Python</span>
            <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-[10px] font-semibold">Java</span>
            <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-[10px] font-semibold">알고리즘</span>
            <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-[10px] font-semibold">기타</span>
          </div>
        </div>
      </div>

      {/* 카드 하단: 작성자 정보 + 조회수/댓글 */}
      <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 flex justify-between items-center">
        {/* 작성자 정보 */}
        <div className="flex items-center gap-2">
          {/* 프로필 이미지 플레이스홀더 */}
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-200 rounded-full"></div>
          <span className="text-xs sm:text-sm text-gray-700 font-medium">34기 씨부엉</span>
        </div>

        {/* 조회수 + 댓글 수 */}
        <div className="flex gap-2 sm:gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1"><Eye size={14} /> 122</span>
          <span className="flex items-center gap-1">
            <MessageCircle size={14} />
            333
          </span>
        </div>
      </div>
    </Link>
  );
}

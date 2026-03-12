/**
 * @file StudyCard.tsx
 * @description 스터디 모집 카드 컴포넌트
 *
 * 스터디 모집 페이지에서 각 스터디 정보를 카드 형태로 표시합니다.
 * - 모집 상태 (모집 중 / 모집 완료)
 * - 스터디 제목
 * - 카테고리 태그 (프로그래밍 언어/분야)
 * - 작성자 정보, 조회수
 */

"use client";

import Link from "next/link";
import { Clock, Eye, User2 } from "lucide-react";

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
export type StudyCategory =
  | "전체"
  | "C++"
  | "Python"
  | "Java"
  | "알고리즘"
  | "기타";

/**
 * 스터디 모집 상태 타입
 * - '모집 중': 초록색 배지
 * - '모집 완료': 빨간색 배지
 */
export type StudyStatus = "모집 중" | "모집 완료";

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
   * 작성 날짜 (YYYY-MM-DD 또는 ISO 문자열)
   * @default '방금 전'
   */
  time?: string;

  /** 작성자 표시 (예: "34기 김민주") */
  authorDisplay?: string;

  /** 조회수 */
  viewCount?: number;

  /** 카테고리 태그 배열 (studyTags) */
  categories?: string[];
  /** 현재 인원 / 최대 인원 (상세와 동일 태그) */
  currentCount?: number;
  maxCount?: number;
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
  category = "C++",
  status = "모집 중",
  title = "웹개발 스터디 모집합니다~",
  time = "방금 전",
  authorDisplay = "씨부엉 멤버",
  viewCount = 0,
  categories: categoriesProp,
  currentCount,
  maxCount,
}: StudyCardProps) {
  // 모집 완료 여부에 따라 배지 색상 결정
  const isCompleted = status === "모집 완료";

  return (
    // 카드 컨테이너 - 호버 시 그림자 효과
    <Link
      href={`/study/${id}`}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
    >
      {/* 카드 상단: 모집 상태, 제목, 카테고리 태그 */}
      <div className="p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 flex-1">
        {/* 상단 행: 모집 상태 배지 + 인원 태그 + 작성 시간 */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {/* 모집 상태 배지 */}
            <span
              className={`text-center py-2 px-3 rounded-full text-xs font-semibold text-white ${
                isCompleted
                  ? "bg-[#FC5E6E]" // 모집 완료
                  : "bg-[#45CD89]" // 모집 중
              }`}
            >
              {status}
            </span>
            {typeof currentCount === "number" &&
              typeof maxCount === "number" &&
              maxCount > 0 && (
                <span className="inline-flex items-center gap-1 py-2 px-3 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                  <User2 size={14} className="text-gray-900" />
                  {currentCount}/{maxCount}
                </span>
              )}
          </div>

          
        </div>

        {/* 중간 영역: 제목 + 카테고리 태그 */}
        <div className="flex flex-col gap-3 sm:gap-4 flex-1">
          {/* 스터디 제목 - 2줄 고정 높이 */}
          <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug line-clamp-2 min-h-11 sm:min-h-14">
            {title}
          </h3>

          <div className="flex flex-wrap gap-1.5">
            {(categoriesProp && categoriesProp.length > 0
              ? categoriesProp
              : [category]
            ).map((cat) => (
              <span
                key={cat}
                className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-[10px] font-semibold"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 카드 하단: 작성자 정보 + 조회수 */}
      <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-gray-700 font-medium">
            {authorDisplay}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Eye size={14} className="shrink-0" />
          <span>{viewCount}</span>
        </div>
        {/* 작성 시간 */}
        <span className="text-gray-400 text-xs font-light flex items-center gap-0.5">
            <Clock size={12} />
            {time}
          </span>
      </div>
      
    </Link>
  );
}

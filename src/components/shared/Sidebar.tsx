/**
 * @file Sidebar.tsx
 * @description 공통 사이드바 컴포넌트
 *
 * 스터디/프로젝트 모집 페이지에서 카테고리 필터링을 위한 사이드바입니다.
 * - 카테고리 목록 표시 및 선택
 * - 글 작성하기 버튼
 * - 페이지 좌측에 고정 (fixed) 배치
 *
 * @todo [대기] 모바일 반응형 - 햄버거 메뉴 또는 하단 시트로 변경 필요
 */

'use client';

import Link from 'next/link';

// ============================================
// 타입 정의
// ============================================

/**
 * 사이드바 아이템 인터페이스
 * 각 카테고리 버튼에 사용됩니다.
 */
interface SidebarItem {
  /** 화면에 표시될 라벨 */
  label: string;
  /** 필터링에 사용될 값 */
  value: string;
}

/**
 * Sidebar 컴포넌트 Props 인터페이스
 */
interface SidebarProps {
  /** 카테고리 아이템 배열 */
  items: SidebarItem[];

  /** 현재 선택된 카테고리 값 */
  selected: string;

  /** 카테고리 선택 시 호출되는 콜백 함수 */
  onSelect: (value: string) => void;

  /** 글 작성하기 버튼 링크 */
  writeLink: string;

  /**
   * 글 작성하기 버튼 라벨
   * @default '글 작성하기'
   */
  writeLabel?: string;
}

// ============================================
// Sidebar 컴포넌트
// ============================================

/**
 * 공통 사이드바 컴포넌트
 *
 * @param props - SidebarProps
 * @returns 사이드바 JSX 요소
 *
 * @example
 * // 스터디 페이지에서 사용
 * <Sidebar
 *   items={CATEGORIES}
 *   selected={selectedCategory}
 *   onSelect={setSelectedCategory}
 *   writeLink="/study/write"
 * />
 *
 * @example
 * // 프로젝트 페이지에서 사용
 * <Sidebar
 *   items={POSITIONS}
 *   selected={selectedPosition}
 *   onSelect={setSelectedPosition}
 *   writeLink="/project/write"
 * />
 */
export default function Sidebar({
  items,
  selected,
  onSelect,
  writeLink,
  writeLabel = '글 작성하기',
}: SidebarProps) {
  return (
    /**
     * 사이드바 컨테이너
     * - w-80: 너비 320px
     * - fixed: 스크롤해도 고정
     * - left-0: 좌측 끝에 배치
     * - top-[83px]: 헤더(80px) + 3px 간격
     * - rounded-r-3xl: 우측 모서리만 둥글게
     *
     * @todo [대기] 모바일에서는 hidden 처리하고 별도 모바일 메뉴 구현 필요
     * 예: className="hidden lg:block w-80 fixed ..."
     */
    <aside className="w-80 fixed left-0 top-[83px] bg-white border-r border-gray-200 rounded-r-3xl">
      {/*
        내부 컨텐츠 래퍼
        - pl-20 pr-12: 좌측 패딩이 우측보다 큼 (디자인 요구사항)
        - pt-14: 상단 여백
        - pb-48: 하단 여백 (글 작성하기 버튼 공간 확보)
      */}
      <div className="pl-20 pr-12 pt-14 pb-48">

        {/* ========== 카테고리 네비게이션 ========== */}
        <nav className="space-y-2">
          {items.map((item) => (
            <button
              key={item.value}
              onClick={() => {
                // 디버깅용 콘솔 로그
                console.log(`[카테고리 선택] ${item.label} (${item.value})`);
                onSelect(item.value);
              }}
              className={`
                w-full text-left px-4 py-3 rounded-xl
                flex items-center gap-2
                transition-all text-sm
                ${selected === item.value
                  // 선택된 상태: 배경색 + 테두리 + 굵은 글씨
                  ? 'bg-gray-100 border border-gray-300 font-medium text-gray-900'
                  // 선택되지 않은 상태: 호버 시 배경색 변경
                  : 'text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              {/* 코드 아이콘 (장식용) */}
              <span className="text-gray-400 text-xs font-mono">&lt;/&gt;</span>
              {/* 카테고리 라벨 */}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* ========== 글 작성하기 버튼 ========== */}
        {/* LongBtn 스타일 적용 (bg-brand, rounded-lg, p-4, font-semibold) */}
        <Link
          href={writeLink}
          className="
            mt-44 w-full
            flex items-center justify-center gap-2
            px-4 py-2.5
            bg-brand hover:opacity-90 active:opacity-80
            text-white font-semibold
            rounded-lg transition-all duration-200
          "
        >
          {/* 펜 아이콘 (SVG) */}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
          {writeLabel}
        </Link>
      </div>
    </aside>
  );
}

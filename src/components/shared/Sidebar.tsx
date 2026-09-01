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

"use client";

import Link from "next/link";
import Image from "next/image";

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
  items: readonly SidebarItem[];

  /** 현재 선택된 카테고리 값 */
  selected: string;

  /** 카테고리 선택 시 호출되는 콜백 함수 */
  onSelect: (value: string) => void;

  /**
   * 글 작성하기 버튼 링크
   * 없으면 글 작성하기 버튼을 렌더하지 않음 (예: user 페이지)
   */
  writeLink?: string;

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
  writeLabel = "글 작성하기",
}: SidebarProps) {
  const showWriteButton = Boolean(writeLink);
  return (
    <>
      {/* 모바일/태블릿 (lg 미만): 상단 가로 스크롤 pill 바 */}
      <div className="lg:hidden px-6 sm:px-8 pt-4 pb-3 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 w-max">
          {items.map((item) => (
            <button
              key={item.value}
              onClick={() => onSelect(item.value)}
              className={`shrink-0 h-10 px-4 rounded-full border text-sm whitespace-nowrap transition-all ${
                selected === item.value
                  ? "bg-gray-900 text-white border-gray-900 font-medium"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 모바일/태블릿 글 작성 FAB (우하단 고정) */}
      {showWriteButton && writeLink && (
        <Link
          href={writeLink}
          aria-label={writeLabel}
          className="lg:hidden fixed bottom-5 right-5 z-30 inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-800 text-gray-0 shadow-lg active:opacity-80"
        >
          <Image src="/assets/pencil.svg" alt="" width={18} height={18} />
        </Link>
      )}

      {/* 데스크탑 (lg 이상): 기존 fixed 사이드바 */}
      <div className="hidden lg:block w-[calc(9.375vw+239px)] fixed left-0 top-[80px] h-20 bg-transparent" />

      {/* 아래 고정 버튼이 있을 때만 카드를 길게 잡는다.
          메뉴가 한두 개인 역할에서는 36rem이 그대로 빈 공간으로 보인다 */}
      <aside
        className={`hidden lg:block w-[calc(9.375vw+240px)] fixed left-0 top-[80px] rounded-r-3xl z-10 ${
          showWriteButton && writeLink
            ? "h-[calc((100vh-80px)*0.75)] min-h-[36rem]"
            : "max-h-[calc(100vh-100px)]"
        }`}
      >
        <div className="pl-[9.375vw] pr-12 pt-14 pb-8 flex flex-col h-full bg-white border border-gray-200 rounded-r-3xl">
          <nav className="space-y-2">
            {items.map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  onSelect(item.value);
                }}
                className={`
                w-full text-left px-4 py-3 rounded-xl border border-transparent
                flex items-center gap-2
                transition-all text-sm
                [outline:0]
                focus-visible:bg-gray-100 active:bg-gray-200
                ${
                  selected === item.value
                    ? "bg-gray-50 border border-gray-50 font-medium text-gray-900"
                    : "text-gray-900 hover:bg-gray-50"
                }
              `}
              >
                <span className="text-gray-400 text-xs font-mono">
                  &lt;/&gt;
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {showWriteButton && writeLink && (
            <div className="mt-auto pt-8">
              <Link
                href={writeLink}
                className="
                w-full
                flex items-center justify-center gap-2
                px-4 py-2.5
                bg-gray-800 text-gray-0 hover:opacity-90 active:opacity-80 font-semibold
                rounded-lg transition-all duration-200
              "
              >
                <Image
                  src="/assets/pencil.svg"
                  alt="글 작성 아이콘"
                  width={16}
                  height={16}
                />
                {writeLabel}
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

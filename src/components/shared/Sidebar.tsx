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
      {/* 
        사이드바 상단 라운딩 뒷배경을 흰색으로 메꾸는 레이어 
        - 사이드바 라운딩(3xl)이 깎이는 부분 뒤로 gray-50이 보이지 않게 함
        - 너비를 사이드바보다 아주 약간 작게 하여 테두리를 가리지 않도록 함
      */}
      <div className="w-[calc(9.375vw+239px)] fixed left-0 top-[80px] h-20 bg-transparent" />

      <aside className="w-[calc(9.375vw+240px)] fixed left-0 top-[80px] h-[calc((100vh-80px)*0.75)] rounded-r-3xl z-10">
      <div className="pl-[9.375vw] pr-12 pt-14 pb-8 flex flex-col h-full bg-white border border-gray-200 rounded-r-3xl">
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
                ${
                  selected === item.value
                    ? // 선택된 상태: 배경색 + 굵은 글씨
                      "bg-gray-50 border border-gray-50 font-medium text-gray-900"
                    : // 선택되지 않은 상태: 호버 시 배경색 변경
                      "text-gray-900 hover:bg-gray-50"
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

        {/* ========== 글 작성하기 버튼 (writeLink 있을 때만) ========== */}
        {showWriteButton && writeLink && (
          <div className="mt-auto pt-32">
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
              {/* 펜 아이콘 (assets/pencil) */}
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

"use client";

import { cn } from "@/lib/utils";

type ChipProps = {
  /** 선택 상태 — 선택 시 brand로 채움 */
  selected?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
};

/**
 * 선택형 필터 칩 (pill) — 선택 시 brand(올리브), 비선택 시 연한 회색.
 * 게시판 카테고리 필터 등에 사용. (Figma: Component/chip)
 *
 * 참고: 작은 라벨 표시는 Tag, 분절 탭 묶음은 Tabs를 사용.
 */
export default function Chip({
  selected = false,
  onClick,
  children,
  className,
}: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
        selected
          ? "bg-brand text-white"
          : "bg-gray-50 text-gray-700 hover:bg-gray-100",
        className,
      )}
    >
      {children}
    </button>
  );
}

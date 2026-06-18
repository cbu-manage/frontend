/**
 * @file Tag.tsx
 * @description 카테고리/포지션 태그 칩 (Figma: chip)
 *
 * 카드의 카테고리·포지션 태그(작은 회색 칩)로 쓰입니다.
 * 기존 Study/Project/ProjectRow 카드에 반복되던
 * `bg-gray-100 text-gray-500 px-2 py-1 rounded text-[10px] font-semibold`
 * 패턴을 추출했습니다.
 *
 * @example
 * <Tag>Python</Tag>
 * <Tag variant="brand">프론트엔드</Tag>
 */

import { cn } from "@/lib/utils";

/** 칩 변형 — gray(기본 회색) / brand(브랜드 틴트) */
export type TagVariant = "gray" | "brand";

interface TagProps {
  variant?: TagVariant;
  children: React.ReactNode;
  className?: string;
}

const VARIANT_CLASS: Record<TagVariant, string> = {
  gray: "bg-gray-100 text-gray-500",
  brand: "bg-brand/10 text-brand",
};

export function Tag({ variant = "gray", children, className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-block rounded px-2 py-1 text-[10px] font-semibold",
        VARIANT_CLASS[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

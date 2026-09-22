/**
 * @file StatusBadge.tsx
 * @description 모집/해결 상태 배지 (Figma: Tag_모집)
 *
 * 스터디·프로젝트·코딩테스트 카드의 "모집 중 / 모집 완료", "해결 / 미해결"
 * 배지로 쓰입니다. 기존엔 각 카드에 `bg-[#45cd89]`·`bg-[#fc5e6e]`로
 * 하드코딩돼 있던 걸 토큰(success/danger) 기반 공통 컴포넌트로 추출했습니다.
 */

import { cn } from "@/lib/utils";

/** 배지 색 톤 — success(초록)/danger(빨강) */
export type StatusTone = "success" | "danger";

/** 크기 — sm(목록 카드 M) / lg(상세 L) */
export type StatusSize = "sm" | "lg";

interface StatusBadgeProps {
  /** 색 톤 */
  tone: StatusTone;
  /** 배지 라벨 (예: "모집 중", "해결") */
  children: React.ReactNode;
  /** 크기 @default "sm" */
  size?: StatusSize;
  className?: string;
}

const TONE_CLASS: Record<StatusTone, string> = {
  success: "bg-success",
  danger: "bg-danger",
};

const SIZE_CLASS: Record<StatusSize, string> = {
  sm: "px-3 py-2 text-xs",
  lg: "px-4 py-2 text-base",
};

export function StatusBadge({
  tone,
  children,
  size = "sm",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold text-white",
        TONE_CLASS[tone],
        SIZE_CLASS[size],
        className,
      )}
    >
      {children}
    </span>
  );
}

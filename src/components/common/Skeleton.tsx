import { cn } from "@/lib/utils";

/**
 * @file Skeleton.tsx
 * @description 콘텐츠 로딩 자리표시자 (회색 펄스 블록).
 *
 * 역할 구분:
 * - **Skeleton** : 데이터 로드 전 레이아웃 자리를 잡는 자리표시자(목록·카드·상세 등).
 * - **LoadingSpinner** : 버튼/인라인 등 짧은 동작 중 표시(제출 중 등).
 */

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

/** 기본 자리표시자 — 크기는 className(h-4, w-1/2 등)으로 지정. */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-gray-100", className)}
      {...props}
    />
  );
}

/** 여러 줄 텍스트 자리표시자 (마지막 줄은 짧게). */
export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={`line-${i}`}
          className={cn("h-4", i === lines - 1 && "w-2/3")}
        />
      ))}
    </div>
  );
}

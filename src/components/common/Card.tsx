import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  /** 비활성/완료 톤 — 연한 회색 배경 (예: 모집 완료 카드) */
  muted?: boolean;
};

/**
 * 베이스 카드 컨테이너 — 흰 배경·라운드·테두리. 도메인 카드(모임/보고서 등)가 이걸 감싼다.
 * (Figma: Component/Card)
 *
 * @example <Card><h3>제목</h3>...</Card>
 * @example <Card muted>모집 완료</Card>
 */
export default function Card({ muted, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 transition-colors",
        muted
          ? "border-transparent bg-gray-50"
          : "border-gray-200 bg-white",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

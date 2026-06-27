import Link from "next/link";
import { Calendar, MapPin, CheckCircle2, Mail } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { cn } from "@/lib/utils";

/**
 * @file MeetingCard.tsx
 * @description 모임 목록 카드 (Figma: Card · 참석 응답)
 *
 * 분류 칩 + 모집 상태 배지 + 제목 + 일시/장소 + 참석 응답 원형으로 구성.
 * 모집 완료(done) 시 회색 톤 + 원형이 "최종 참석"으로 바뀜.
 */

export type MeetingCardProps = {
  category: string; // 모임 / MT / 회식 …
  /** false=모집 중(진행 예정), true=모집 완료(지난 모임) */
  done: boolean;
  title: string;
  date: string;
  location: string;
  /** 참석 응답 / 최종 참석 인원 */
  responded: number;
  /** 정원 */
  capacity: number;
  /** 있으면 카드 전체를 링크로 감쌈 */
  href?: string;
  className?: string;
};

// 분류 칩 색(연한 틴트) — 모임/MT/회식, 그 외는 회색 폴백
const CATEGORY_STYLE: Record<string, string> = {
  모임: "bg-pink-50 text-pink-500",
  MT: "bg-orange-50 text-orange-500",
  회식: "bg-amber-50 text-amber-600",
};

/** 참석 응답 / 최종 참석 원형 배지 */
export function AttendanceCircle({
  done,
  responded,
  capacity,
}: Pick<MeetingCardProps, "done" | "responded" | "capacity">) {
  return (
    <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-full bg-white text-center shadow-sm">
      <span className="flex items-center gap-1 text-[11px] font-medium text-gray-500">
        {done ? (
          <Mail size={12} className="text-gray-400" />
        ) : (
          <CheckCircle2 size={12} className="text-success" />
        )}
        {done ? "최종 참석" : "참석 응답"}
      </span>
      <span className="mt-0.5">
        <span className="text-xl font-bold text-gray-900">{responded}</span>
        <span className="text-xs text-gray-400"> /{capacity}</span>
      </span>
    </div>
  );
}

export default function MeetingCard({
  category,
  done,
  title,
  date,
  location,
  responded,
  capacity,
  href,
  className,
}: MeetingCardProps) {
  const body = (
    <>
      <div className="flex min-w-0 flex-col">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
              CATEGORY_STYLE[category] ?? "bg-gray-100 text-gray-500",
            )}
          >
            {category}
          </span>
          <StatusBadge tone={done ? "danger" : "success"}>
            {done ? "모집 완료" : "모집 중"}
          </StatusBadge>
        </div>

        <h3 className="mt-4 truncate text-title-lg text-gray-900">{title}</h3>

        <div className="mt-6 space-y-2 text-sm text-gray-600">
          <p className="flex items-center gap-2">
            <Calendar size={15} className="shrink-0 text-gray-400" />
            {date}
          </p>
          <p className="flex items-center gap-2">
            <MapPin size={15} className="shrink-0 text-gray-400" />
            {location}
          </p>
        </div>
      </div>

      <AttendanceCircle done={done} responded={responded} capacity={capacity} />
    </>
  );

  const base = cn(
    "flex justify-between gap-4 rounded-2xl border border-gray-200 p-6",
    done ? "bg-gray-50" : "bg-white",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={cn(base, "transition-shadow hover:shadow-md")}>
        {body}
      </Link>
    );
  }
  return <div className={base}>{body}</div>;
}

import Link from "next/link";
import { Clock } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { PersonIcon } from "@/components/icons/PersonIcon";

type ReportCardProps = {
  id: number;
  tag: string;
  title: string;
  author: string;
  /** 작성자 기수 (있으면 "12기 홍길동"으로 표시) */
  generation?: number;
  /** 활동 일자 (ISO 문자열) — 카드에서 yyyy.MM.dd로 포맷 */
  date: string;
};

/** 활동일 표시 (yyyy.MM.dd) — 값이 없거나 잘못되면 "-" (parseISO로 로컬 시간대 해석) */
function formatDate(iso?: string): string {
  if (!iso) return "-";
  const d = parseISO(iso);
  return isValid(d) ? format(d, "yyyy.MM.dd") : "-";
}

export default function ReportCard({ id, tag, title, author, generation, date }: ReportCardProps) {
  const authorLabel = generation != null ? `${generation}기 ${author}` : author;

  return (
    <Link
      href={`/report/${id}`}
      className="flex min-h-52 flex-col rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      {/* 상단: 팀/스터디 태그 + 제목 */}
      <div className="flex flex-1 flex-col gap-3.5 p-6">
        <span className="inline-block self-start rounded-full bg-report-badge px-3.5 py-1.5 text-xs font-medium text-white">
          {tag}
        </span>
        <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
          {title}
        </h3>
      </div>

      {/* 하단(구분선): 기수·이름 | 활동일 */}
      <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5 min-w-0">
          <PersonIcon size={14} className="text-gray-400 shrink-0" />
          <span className="truncate">{authorLabel}</span>
        </span>
        <span className="flex items-center gap-1 shrink-0">
          <Clock size={12} className="shrink-0" />
          {formatDate(date)}
        </span>
      </div>
    </Link>
  );
}

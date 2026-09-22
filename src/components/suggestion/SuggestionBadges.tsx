import type { SuggestionStatus, SuggestionType } from "@/api";

export const SUGGESTION_TYPE_LABEL: Record<SuggestionType, string> = {
  BUG: "버그",
  SUGGESTION: "건의",
};

export const SUGGESTION_STATUS_LABEL: Record<SuggestionStatus, string> = {
  OPEN: "미해결",
  RESOLVED: "해결",
};

/** 글쓰기 폼 분류 라벨 ↔ 서버 type */
export const SUGGESTION_TYPE_OPTIONS: {
  label: string;
  value: SuggestionType;
}[] = [
  { label: "버그 리포트", value: "BUG" },
  { label: "기능 건의·불편 사항", value: "SUGGESTION" },
];

export function SuggestionTypeBadge({ type }: { type: SuggestionType }) {
  const cls =
    type === "BUG" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700";
  return (
    <span
      className={`inline-block shrink-0 rounded px-2 py-0.5 text-xs font-semibold ${cls}`}
    >
      {SUGGESTION_TYPE_LABEL[type] ?? type}
    </span>
  );
}

export function SuggestionStatusBadge({
  status,
}: {
  status: SuggestionStatus;
}) {
  const cls =
    status === "RESOLVED"
      ? "bg-brand/10 text-brand"
      : "bg-gray-100 text-gray-600";
  return (
    <span
      className={`inline-block shrink-0 rounded px-2 py-0.5 text-xs font-semibold ${cls}`}
    >
      {SUGGESTION_STATUS_LABEL[status] ?? status}
    </span>
  );
}

import { format, formatDistanceToNow, parseISO } from "date-fns";
import { ko } from "date-fns/locale";

/**
 * 날짜 포맷 — ISO 문자열(서버 응답) 또는 Date → 포맷 문자열.
 * 왜 쓰나: 컴포넌트마다 date-fns 직접 쓰지 말고 여기로 통일.
 *
 * @example formatDate("2026-06-18T10:00:00")        // "2026.06.18"
 * @example formatDate(d, "yyyy년 M월 d일")            // 패턴 직접 지정
 */
export function formatDate(value: string | Date, pattern = "yyyy.MM.dd"): string {
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, pattern, { locale: ko });
}

/**
 * 상대 시간 — "3시간 전", "2일 전" 형태.
 * @example formatRelativeTime("2026-06-18T07:00:00") // "5시간 전"
 */
export function formatRelativeTime(value: string | Date): string {
  const date = typeof value === "string" ? parseISO(value) : value;
  return formatDistanceToNow(date, { addSuffix: true, locale: ko });
}

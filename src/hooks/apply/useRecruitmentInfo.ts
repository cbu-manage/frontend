"use client";

import { useQuery } from "@tanstack/react-query";
import { applyApi } from "@/api";

/**
 * 현재 모집의 기수·일정을 화면 문구로 바꿔 돌려준다.
 *
 * 값이 없을 때는 빈 문자열/null을 주므로, 쓰는 쪽에서 해당 문구를 통째로 빼면 된다.
 * (진행 중인 모집이 없으면 서버가 404 → 에러가 아니라 "모집 없음"으로 취급)
 */
export function useRecruitmentInfo() {
  const { data, isLoading } = useQuery({
    queryKey: ["applications", "generation", "current"],
    queryFn: async () => {
      try {
        return (await applyApi.getCurrentGeneration()).data.data;
      } catch {
        return null;
      }
    },
  });

  const generationLabel = data ? `${data.generation}기` : "";

  const periodLabel =
    data?.plannedStartDate && data?.plannedEndDate
      ? `${formatDot(data.plannedStartDate)}~${formatDot(data.plannedEndDate, true)} (23:59 마감)`
      : null;

  const resultLabel = data?.announcementDate
    ? `${formatDot(data.announcementDate)} (개별 안내)`
    : null;

  // 서버가 accepting: false 를 줄 때만 닫힌 것으로 본다.
  // 로딩 중·조회 실패·옛 서버(필드 없음)는 예전처럼 열린 것으로 두고, 제출은 서버가 거른다.
  const accepting = data?.accepting ?? true;

  return {
    recruitment: data ?? null,
    accepting,
    generationLabel,
    periodLabel,
    resultLabel,
    isLoading,
  };
}

/** 2026-09-01 → 2026.09.01 (monthDayOnly면 09.01) */
function formatDot(iso: string, monthDayOnly = false): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return monthDayOnly ? `${m}.${d}` : `${y}.${m}.${d}`;
}

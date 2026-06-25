"use client";

import { useUserStore } from "@/store/userStore";

/**
 * 보고서 관리 권한 여부 — HWP/ZIP 추출·전체 보고서 관리 UI 노출용 (UI 게이팅 전용).
 * ⚠️ 실제 권한은 서버가 최종 판정(403/200). 이 훅은 버튼/페이지 보임/숨김일 뿐.
 *
 * 정책(백엔드 권한 스펙 기준): 보고서 전체 조회·추출은 **최고관리자**만.
 * 전체 보고서 조회 권한 = ADMIN / PRESIDENT / VICE_PRESIDENT (그 외 운영진·일반부원 제외).
 * (서기(SECRETARY) 보고서 조회 권한은 백엔드 "수정 예정"이라 반영 시 여기 추가)
 */
const REPORT_MANAGER_ROLES = new Set([
  "ROLE_ADMIN",
  "ROLE_PRESIDENT",
  "ROLE_VICE_PRESIDENT",
]);

export function useCanManageReports(): boolean {
  const role = useUserStore((s) => s.role);
  return REPORT_MANAGER_ROLES.has((role ?? "").toUpperCase());
}

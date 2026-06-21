"use client";

import { useUserStore } from "@/store/userStore";

/**
 * 보고서 관리 권한 여부 — HWP/ZIP 추출·승인·전체 보고서 관리 UI 노출용 (UI 게이팅 전용).
 * ⚠️ 실제 권한은 서버가 최종 판정(403/200). 이 훅은 버튼/페이지 보임/숨김일 뿐.
 *
 * 현재 정책: ROLE_USER(일반 부원) 외 모든 역할을 관리자로 취급.
 * (ADMIN/PRESIDENT/VICE/MANAGER/... 세부 역할별 구분은 추후 확정)
 */
export function useCanManageReports(): boolean {
  const role = useUserStore((s) => s.role);
  const normalized = role.toUpperCase();
  return normalized !== "" && normalized !== "ROLE_USER";
}

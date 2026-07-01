"use client";

import { useUserStore } from "@/store/userStore";

/** 모임 등록/수정/삭제/마감 허용 역할 (서버 기준): 개발자관리자·회장·부회장·행사관리 */
const MANAGER_ROLES = [
  "ROLE_ADMIN",
  "ROLE_PRESIDENT",
  "ROLE_VICE_PRESIDENT",
  "ROLE_EVENT_MANAGER",
];

/**
 * 모임을 관리(등록/수정/삭제/마감)할 수 있는지 — 버튼 노출 게이팅용.
 * ⚠️ UI 노출 전용. 실제 접근은 서버가 최종 판정(401/403).
 */
export function useCanManageGathering() {
  const role = useUserStore((s) => s.role);
  const isAdmin = useUserStore((s) => s.isAdmin);
  return isAdmin || MANAGER_ROLES.includes(role);
}

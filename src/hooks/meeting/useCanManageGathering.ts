"use client";

import { useCan } from "@/hooks/auth";

/**
 * 모임을 관리(등록/수정/삭제/마감)할 수 있는지 — 버튼 노출 게이팅용.
 *
 * 역할 목록을 여기서 따로 들고 있으면 permissions.ts와 어긋날 수 있어 capability로 위임한다.
 * ⚠️ UI 노출 전용. 실제 접근은 서버가 최종 판정(401/403).
 */
export function useCanManageGathering(): boolean {
  return useCan("meetings.manage");
}

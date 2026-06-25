"use client";

import { useUserStore } from "@/store/userStore";
import { can, type Capability } from "@/lib/permissions";

/**
 * 현재 로그인 사용자가 capability를 가지는지 — 버튼/메뉴 노출 게이팅용.
 * role은 userStore에서 읽고, role→capability 매핑은 src/lib/permissions.ts.
 *
 * ⚠️ UI 노출 전용. 실제 접근은 서버가 최종 판정(401/403)한다.
 *
 * @example
 *   const canManageNews = useCan("news.manage");
 *   {canManageNews && <소식작성버튼 />}
 */
export function useCan(cap: Capability): boolean {
  const role = useUserStore((s) => s.role);
  return can(role, cap);
}

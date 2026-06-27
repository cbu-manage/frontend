"use client";

import { useUserStore } from "@/store/userStore";

/**
 * 운영진 여부(일반 회원 ROLE_USER 제외 = 운영진/관리자) — 글 작성 등 UI 게이팅용.
 *
 * ⚠️ 임시 role 기반 체크. feat/118(권한 토대) 머지 후 `useCan("news.manage")` 등
 *    capability 기반으로 교체할 것. 실제 차단은 서버가 최종 판정.
 */
export function useIsStaff() {
  const role = useUserStore((s) => s.role);
  return !!role && role !== "ROLE_USER";
}

"use client";

import { useCan } from "./useCan";

/**
 * 보고서 관리 권한 여부 — HWP/ZIP 추출·전체 보고서 관리 UI 노출용 (UI 게이팅 전용).
 *
 * 역할 목록을 여기서 따로 들고 있으면 permissions.ts와 어긋날 수 있어 capability로 위임한다.
 * ⚠️ 실제 권한은 서버가 최종 판정(403/200). 이 훅은 버튼/페이지 보임/숨김일 뿐.
 *
 * 참고: 서버의 추출 API는 서기(ROLE_SECRETARY)도 허용하는데 reportDocs.manage에는 없다.
 * 서기에게 열지 여부는 정책 판단이라 여기서 바꾸지 않는다.
 */
export function useCanManageReports(): boolean {
  return useCan("reportDocs.manage");
}

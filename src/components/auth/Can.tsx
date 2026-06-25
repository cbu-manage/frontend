"use client";

import type { ReactNode } from "react";
import { useCan } from "@/hooks/auth/useCan";
import type { Capability } from "@/lib/permissions";

type CanProps = {
  /** 필요한 capability */
  do: Capability;
  children: ReactNode;
  /** 권한 없을 때 렌더 (기본 null = 숨김) */
  fallback?: ReactNode;
};

/**
 * capability 있으면 children, 없으면 fallback 렌더 — 버튼/섹션 단위 게이팅.
 * ⚠️ UI 노출 전용. 실제 접근은 서버가 최종 판정.
 *
 * @example <Can do="news.manage"><WriteButton /></Can>
 */
export default function Can({ do: cap, children, fallback = null }: CanProps) {
  return useCan(cap) ? <>{children}</> : <>{fallback}</>;
}

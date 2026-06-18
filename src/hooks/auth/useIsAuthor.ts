"use client";

import { useUserStore } from "@/store/userStore";

/**
 * 게시물 소유 여부 판단 — 수정/삭제 버튼 노출용 (UI 게이팅 전용).
 * ⚠️ 실제 권한은 서버가 최종 판정(401/200)한다. 이 훅은 버튼 보임/숨김일 뿐.
 *
 * 우선순위:
 *  1) 서버가 내려준 isAuthor (study/codingTest 등) — 있으면 그대로 신뢰
 *  2) 없으면 내 userId === 게시물 authorId 비교 (number/uuid 무관하게 String 비교)
 * canModify = 본인 || 관리자(isAdmin).
 *
 * @example
 *   const { canModify } = useIsAuthor(post.authorId, post.isAuthor);
 *   {canModify && <EditDeleteButtons />}
 */
export function useIsAuthor(
  authorId?: string | number | null,
  serverIsAuthor?: boolean,
) {
  const userId = useUserStore((s) => s.userId);
  const isAdmin = useUserStore((s) => s.isAdmin);

  const isAuthor =
    serverIsAuthor ??
    (!!userId && authorId != null && String(userId) === String(authorId));

  return { isAuthor, canModify: isAuthor || isAdmin };
}

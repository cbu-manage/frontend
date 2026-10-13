"use client";

import { useQuery } from "@tanstack/react-query";
import { memberApi, type MemberInfo } from "@/api/member.api";

/** 서버 GET /members 의 size 상한(MAX_MEMBER_PAGE_SIZE)에 맞춰 한 번에 최대로 받는다. */
const FETCH_SIZE = 100;

/** 회원 목록을 쓰는 화면(회원 관리·운영진 지정)이 공유하는 키. 회원 수정·삭제 뒤 이 키로 무효화한다. */
export const ALL_MEMBERS_QUERY_KEY = ["admin", "members"] as const;

type ParsedPage = { items: MemberInfo[]; last: boolean };

/** 서버 응답이 배열(ApiResponseListMemberDTO)·페이징(Page) 둘 다 존재해 방어적으로 파싱한다. */
function parsePage(raw: unknown): ParsedPage {
  if (Array.isArray(raw)) return { items: raw as MemberInfo[], last: true };
  const obj = (raw ?? {}) as Record<string, unknown>;
  const inner = (obj.data ?? obj) as Record<string, unknown>;
  if (Array.isArray(inner)) return { items: inner as MemberInfo[], last: true };
  const items = Array.isArray(inner.content) ? (inner.content as MemberInfo[]) : [];
  return { items, last: inner.last === true };
}

/**
 * 전체 회원을 받는다. 서버에 이름·기수 검색이 없어 필터는 클라이언트에서 하므로 전체가 필요하다.
 * 페이지 응답의 `last` 로 끝을 판단하고, 서버가 size 를 무시해 같은 페이지를 되돌려 줘도
 * id 중복이면 멈춰 무한루프를 막는다.
 */
async function fetchAllMembers(): Promise<MemberInfo[]> {
  const all: MemberInfo[] = [];
  const seen = new Set<number>();
  let page = 0;
  while (true) {
    const res = await memberApi.getAll(page, FETCH_SIZE);
    const { items, last } = parsePage(res.data as unknown);
    const fresh = items.filter((m) => !seen.has(m.id));
    if (fresh.length === 0) break;
    fresh.forEach((m) => seen.add(m.id));
    all.push(...fresh);
    if (last) break;
    page += 1;
  }
  return all;
}

/** 전체 회원 목록 — 5분간 신선한 것으로 보고 탭 이동·포커스 복귀마다 다시 받지 않는다. */
export function useAllMembers() {
  return useQuery({
    queryKey: ALL_MEMBERS_QUERY_KEY,
    queryFn: fetchAllMembers,
    staleTime: 5 * 60 * 1000,
  });
}

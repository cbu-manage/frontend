"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { authApi, type MeResponseData } from "@/api/auth.api";
import { useUserStore } from "@/store/userStore";

export const ME_QUERY_KEY = ["auth", "me"] as const;

/**
 * 로그인한 사용자 정보(/login/me).
 * userStore에 name이 있을 때만 조회 — 비로그인 상태에선 401 피하려고 skip.
 * 응답을 받으면 userStore에 hydrate(userId·role 포함) — 본인 게시물 판별/권한용.
 */
export function useMe() {
  const isLoggedIn = useUserStore((s) => !!s.name);
  const setUser = useUserStore((s) => s.setUser);

  const query = useQuery<MeResponseData>({
    queryKey: ME_QUERY_KEY,
    queryFn: async () => {
      const res = await authApi.me();
      return res.data.data;
    },
    enabled: isLoggedIn,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const me = query.data;
    if (!me) return;
    const isAdmin = !!me.role && me.role.toUpperCase().includes("ADMIN");
    setUser({
      userId: String(me.userId), // number/uuid 무관하게 문자열로 보관
      role: me.role,
      name: me.name,
      studentNumber: me.studentNumber,
      email: me.email,
      major: me.major,
      grade: me.grade,
      isAdmin,
    });
  }, [query.data, setUser]);

  return query;
}

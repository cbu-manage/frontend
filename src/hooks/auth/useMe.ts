"use client";

import { useQuery } from "@tanstack/react-query";
import { authApi, type MeResponseData } from "@/api/auth.api";
import { useUserStore } from "@/store/userStore";

export const ME_QUERY_KEY = ["auth", "me"] as const;

/**
 * 로그인한 사용자 정보(/login/me).
 * userStore에 name이 있을 때만 조회 — 비로그인 상태에선 401 피하려고 skip.
 */
export function useMe() {
  const isLoggedIn = useUserStore((s) => !!s.name);

  return useQuery<MeResponseData>({
    queryKey: ME_QUERY_KEY,
    queryFn: async () => {
      const res = await authApi.me();
      return res.data.data;
    },
    enabled: isLoggedIn,
    staleTime: 5 * 60 * 1000,
  });
}

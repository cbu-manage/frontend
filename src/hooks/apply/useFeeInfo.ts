"use client";

import { useQuery } from "@tanstack/react-query";
import { settingsApi } from "@/api";

/**
 * 지원자에게 보여줄 회비·계좌 안내 (비로그인 공개).
 * 운영진이 아직 등록하지 않았으면 서버가 404 → 에러가 아니라 "미등록(null)"으로 취급한다.
 */
export function useFeeInfo() {
  const { data, isLoading } = useQuery({
    queryKey: ["fee-info", "public"],
    queryFn: async () => {
      try {
        return (await settingsApi.getPublicFeeInfo()).data.data;
      } catch {
        return null;
      }
    },
  });

  return { feeInfo: data ?? null, isLoading };
}

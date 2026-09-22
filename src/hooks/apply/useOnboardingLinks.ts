"use client";

import { useQuery } from "@tanstack/react-query";
import { settingsApi } from "@/api";

/**
 * 신규 회원에게 안내할 채널 링크 (비로그인 공개).
 * 운영진이 아직 등록하지 않은 채널은 빈 문자열로 내려오므로, 호출부에서 걸러 쓴다.
 */
export function useOnboardingLinks() {
  const { data, isLoading } = useQuery({
    queryKey: ["onboarding-links", "public"],
    queryFn: async () => {
      try {
        return (await settingsApi.getPublicOnboardingLinks()).data.data;
      } catch {
        return null;
      }
    },
  });

  return { links: data ?? null, isLoading };
}

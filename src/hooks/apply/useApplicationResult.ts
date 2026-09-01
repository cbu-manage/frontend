"use client";

import { useQuery } from "@tanstack/react-query";
import { applyApi } from "@/api";

/**
 * 합격 안내 메일 링크(`?a=<지원서 UUID>`)로 들어온 사람의 본인 확인 정보.
 *
 * UUID가 없거나 합격한 지원서가 아니면 null을 준다. 화면에서는 정보 영역만 빼고
 * 나머지 안내는 그대로 보여주면 된다.
 */
export function useApplicationResult(applicationUuid: string | null) {
  const { data, isLoading } = useQuery({
    queryKey: ["applications", "result", applicationUuid],
    enabled: !!applicationUuid,
    queryFn: async () => {
      try {
        return (await applyApi.getResult(applicationUuid as string)).data.data;
      } catch {
        return null;
      }
    },
  });

  return { result: data ?? null, isLoading: !!applicationUuid && isLoading };
}

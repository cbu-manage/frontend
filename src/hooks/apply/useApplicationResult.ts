"use client";

import { useQuery } from "@tanstack/react-query";
import { applyApi, type ApplicationResult } from "@/api";

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
        // 이 엔드포인트만 서버가 봉투({code,message,data}) 없이 raw DTO로 응답한다.
        // 봉투면 .data.data, raw면 .data 자체를 쓴다.
        const body = (await applyApi.getResult(applicationUuid as string))
          .data as unknown as ApplicationResult & { data?: ApplicationResult };
        return body?.data ?? body ?? null;
      } catch {
        return null;
      }
    },
  });

  return { result: data ?? null, isLoading: !!applicationUuid && isLoading };
}

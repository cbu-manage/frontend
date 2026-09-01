"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";
import { groupApi } from "@/api";

type UseGroupRejectionParams = {
  groupId?: number;
  /** 반려 사유는 팀장에게만 필요하다 — 권한이 있을 때만 조회한다 */
  enabled: boolean;
  /** 재심사 요청 후 함께 갱신할 상세 쿼리 키 (["project", id] 등) */
  detailQueryKey: QueryKey;
};

/**
 * 반려된 팀의 재심사 흐름. 프로젝트·스터디 상세가 같은 규칙을 쓴다.
 * 반려 사유는 그룹 상세에만 담겨 오고, 모집을 마감하면 RESUBMITTED가 된다.
 */
export function useGroupRejection({
  groupId,
  enabled,
  detailQueryKey,
}: UseGroupRejectionParams) {
  const queryClient = useQueryClient();

  const { data: groupRes } = useQuery({
    queryKey: ["group", groupId],
    queryFn: () => groupApi.getById(groupId as number),
    enabled: !!groupId && enabled,
  });
  const group = groupRes?.data?.data;
  const isRejected = group?.groupStatus === "REJECTED";

  const resubmitMutation = useMutation({
    mutationFn: async () => {
      if (!groupId) return;
      await groupApi.updateRecruitment(groupId, {
        groupRecruitmentStatus: "CLOSED",
      });
    },
    // TODO: react-query v6 onSuccess/onError/onSettled deprecation - 마이그레이션 검토
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: detailQueryKey });
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      alert("다시 신청했어요. 운영진 심사를 기다려주세요.");
    },
    onError: (err) => {
      alert((err as Error).message || "다시 신청하지 못했어요.");
    },
  });

  return {
    group,
    isRejected,
    resubmit: () => resubmitMutation.mutate(),
    isResubmitting: resubmitMutation.isPending,
  };
}

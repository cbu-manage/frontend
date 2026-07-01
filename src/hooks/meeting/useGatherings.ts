"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  gatheringApi,
  type Gathering,
  type AttendanceList,
  type VoteDecision,
  type CreateGatheringBody,
  type UpdateGatheringBody,
} from "@/api";

const LIST_KEY = ["gatherings"] as const;
const detailKey = (id: number) => ["gathering", id] as const;
const attendanceKey = (id: number) => ["gathering", id, "attendance"] as const;

/** 모임 목록 */
export function useGatherings() {
  return useQuery({
    queryKey: LIST_KEY,
    queryFn: async (): Promise<Gathering[]> =>
      (await gatheringApi.getList()).data.data,
  });
}

/** 모임 상세 */
export function useGathering(id: number | null) {
  return useQuery({
    queryKey: detailKey(id ?? -1),
    enabled: id != null,
    queryFn: async (): Promise<Gathering> =>
      (await gatheringApi.getById(id as number)).data.data,
  });
}

/** 참석 명단 (투표 그룹) */
export function useAttendance(id: number | null) {
  return useQuery({
    queryKey: attendanceKey(id ?? -1),
    enabled: id != null,
    queryFn: async (): Promise<AttendanceList> =>
      (await gatheringApi.getAttendance(id as number)).data.data,
  });
}

/** 모임 등록 */
export function useCreateGathering() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateGatheringBody) => gatheringApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: LIST_KEY }),
  });
}

/** 모임 수정 */
export function useUpdateGathering(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateGatheringBody) => gatheringApi.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LIST_KEY });
      qc.invalidateQueries({ queryKey: detailKey(id) });
    },
  });
}

/** 모임 삭제 */
export function useDeleteGathering() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => gatheringApi.remove(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: LIST_KEY });
      // 삭제된 항목의 상세/참석 캐시 제거 (뒤로가기 재진입 시 stale 노출 방지)
      qc.removeQueries({ queryKey: detailKey(id) });
      qc.removeQueries({ queryKey: attendanceKey(id) });
    },
  });
}

/** 참석 투표 */
export function useVoteGathering(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (decision: VoteDecision) => gatheringApi.vote(id, decision),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: detailKey(id) });
      qc.invalidateQueries({ queryKey: attendanceKey(id) });
    },
  });
}

/** 투표 마감 */
export function useCloseGathering(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => gatheringApi.close(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LIST_KEY });
      qc.invalidateQueries({ queryKey: detailKey(id) });
    },
  });
}

"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { groupApi } from "@/api";
import Mascot from "@/components/common/Mascot";

type GroupItem = {
  groupId: number;
  postId?: number;
  groupName: string;
  createdAt?: string;
  activeMemberCount: number;
  maxMembers: number;
  groupStatus: string;
  groupRecruitmentStatus: string;
  leaderId?: number;
  leaderGeneration?: number;
  leaderName?: string;
};

type StatusFilter = "전체" | "PENDING" | "ACTIVE" | "REJECTED";

/** 심사 대기로 묶어 보는 상태 — 신규 개설(PENDING)과 재심사 요청(RESUBMITTED) */
const PENDING_STATUSES: string[] = ["PENDING", "RESUBMITTED"];

/** 서버 상태값 → 화면 표기. 서버는 5종을 내려준다 */
const STATUS_LABEL: Record<string, { text: string; className: string }> = {
  PENDING: { text: "승인 대기 중", className: "bg-amber-100 text-amber-700" },
  RESUBMITTED: {
    text: "재심사 요청",
    className: "bg-amber-100 text-amber-700",
  },
  ACTIVE: { text: "승인됨", className: "bg-blue-100 text-blue-700" },
  REJECTED: { text: "반려됨", className: "bg-red-100 text-red-700" },
  INACTIVE: { text: "비활동", className: "bg-gray-100 text-gray-600" },
};

function extractGroups(raw: unknown): GroupItem[] {
  if (!raw || typeof raw !== "object") return [];
  const obj = raw as Record<string, unknown>;
  const data = obj.data ?? obj;
  if (Array.isArray(data)) return data as GroupItem[];
  if (data && typeof data === "object" && "content" in data) {
    const c = (data as { content?: unknown }).content;
    return Array.isArray(c) ? (c as GroupItem[]) : [];
  }
  return [];
}

function formatDate(iso?: string) {
  if (!iso) return "-";
  try {
    return new Date(iso)
      .toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\. /g, ". ");
  } catch {
    return iso;
  }
}

export default function GroupManageSection() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("전체");

  const {
    data: res,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["groups", "admin"],
    queryFn: () => groupApi.getAll({ page: 0, size: 100 }),
  });

  const groups = useMemo(() => extractGroups(res?.data ?? null), [res]);

  // 심사 대상은 모집을 마감한 팀. 단 반려되면 서버가 모집을 다시 열어주므로,
  // 상태로도 걸러 반려된 팀이 목록에서 사라지지 않게 한다.
  const reviewable = useMemo(
    () =>
      groups.filter(
        (g) =>
          g.groupRecruitmentStatus === "CLOSED" || g.groupStatus === "REJECTED",
      ),
    [groups],
  );

  const filtered = useMemo(() => {
    if (statusFilter === "전체") return reviewable;
    if (statusFilter === "PENDING")
      return reviewable.filter((g) => PENDING_STATUSES.includes(g.groupStatus));
    return reviewable.filter((g) => g.groupStatus === statusFilter);
  }, [reviewable, statusFilter]);

  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const reviewMutation = useMutation({
    mutationFn: ({
      groupId,
      action,
      reason,
    }: {
      groupId: number;
      action: "APPROVE" | "REJECT";
      reason?: string;
    }) => groupApi.updateStatus(groupId, { action, reason }),
    // TODO: react-query v6 onSuccess/onError/onSettled deprecation - 마이그레이션 검토
    onSuccess: () => {
      setRejectingId(null);
      setRejectReason("");
      queryClient.invalidateQueries({ queryKey: ["groups", "admin"] });
    },
    onError: (err) => {
      window.alert((err as Error).message || "처리 중 오류가 발생했습니다.");
    },
  });

  const countByStatus = useMemo(() => {
    const pending = reviewable.filter((g) =>
      PENDING_STATUSES.includes(g.groupStatus),
    ).length;
    const active = reviewable.filter((g) => g.groupStatus === "ACTIVE").length;
    const rejected = reviewable.filter(
      (g) => g.groupStatus === "REJECTED",
    ).length;
    return { pending, active, rejected, total: reviewable.length };
  }, [reviewable]);

  const statusFilters: { label: string; value: StatusFilter; count: number }[] =
    [
      { label: "전체", value: "전체", count: countByStatus.total },
      { label: "승인 대기", value: "PENDING", count: countByStatus.pending },
      { label: "승인됨", value: "ACTIVE", count: countByStatus.active },
      { label: "반려됨", value: "REJECTED", count: countByStatus.rejected },
    ];

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-h1 text-gray-900 mb-6">그룹 관리</h1>

      <div className="flex items-center gap-4 mb-6">
        {statusFilters.map((s) => (
          <button
            key={s.value}
            onClick={() => setStatusFilter(s.value)}
            className={`text-sm transition-colors ${
              statusFilter === s.value
                ? "text-gray-900 font-semibold"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {s.label}({s.count})
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="py-12 text-center text-gray-500">
          그룹 목록을 불러오는 중...
        </div>
      )}
      {isError && (
        <div className="py-12 text-center text-red-500">
          그룹 목록을 불러오지 못했습니다.
        </div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="flex size-28 items-center justify-center rounded-full bg-gray-100">
            <Mascot emotion="working" size="md" decorative />
          </div>
          <p className="mt-5 text-lg font-bold text-gray-800">
            해당 상태의 그룹이 없습니다.
          </p>
        </div>
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-center font-medium text-gray-700">
                  그룹명
                </th>
                <th className="p-3 text-center font-medium text-gray-700">
                  팀장
                </th>
                <th className="p-3 text-center font-medium text-gray-700">
                  인원
                </th>
                <th className="p-3 text-center font-medium text-gray-700">
                  모집 상태
                </th>
                <th className="p-3 text-center font-medium text-gray-700">
                  생성일
                </th>
                <th className="p-3 text-center font-medium text-gray-700">
                  상태
                </th>
                <th className="p-3 text-center font-medium text-gray-700">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((group) => {
                const isPending = PENDING_STATUSES.includes(group.groupStatus);
                const statusLabel = STATUS_LABEL[group.groupStatus] ?? {
                  text: group.groupStatus,
                  className: "bg-gray-100 text-gray-600",
                };
                const isRejecting = rejectingId === group.groupId;
                const leaderDisplay = group.leaderName
                  ? group.leaderGeneration
                    ? `${group.leaderGeneration}기 ${group.leaderName}`
                    : group.leaderName
                  : "-";

                return (
                  <tr
                    key={group.groupId}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-3 text-left font-medium max-w-[200px] truncate">
                      {group.groupName}
                    </td>
                    <td className="p-3 text-center text-gray-600">
                      {leaderDisplay}
                    </td>
                    <td className="p-3 text-center">
                      {group.activeMemberCount}/{group.maxMembers}
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                        {group.groupRecruitmentStatus === "CLOSED"
                          ? "모집 마감"
                          : "모집 중"}
                      </span>
                    </td>
                    <td className="p-3 text-center text-gray-500">
                      {formatDate(group.createdAt)}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusLabel.className}`}
                      >
                        {statusLabel.text}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {!isPending ? (
                        <span className="text-xs text-gray-400">-</span>
                      ) : isRejecting ? (
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="text"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="반려 사유"
                            aria-label="반려 사유"
                            className="w-40 rounded-lg border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                          />
                          <button
                            type="button"
                            disabled={
                              !rejectReason.trim() || reviewMutation.isPending
                            }
                            onClick={() =>
                              reviewMutation.mutate({
                                groupId: group.groupId,
                                action: "REJECT",
                                reason: rejectReason.trim(),
                              })
                            }
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-900 text-white hover:opacity-90 disabled:bg-gray-200 disabled:text-gray-500 transition-opacity"
                          >
                            반려
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRejectingId(null);
                              setRejectReason("");
                            }}
                            className="px-2 py-1.5 text-xs text-gray-500 hover:text-gray-700"
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            disabled={reviewMutation.isPending}
                            onClick={() =>
                              reviewMutation.mutate({
                                groupId: group.groupId,
                                action: "APPROVE",
                              })
                            }
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
                          >
                            승인
                          </button>
                          <button
                            type="button"
                            disabled={reviewMutation.isPending}
                            onClick={() => {
                              setRejectingId(group.groupId);
                              setRejectReason("");
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                          >
                            거절
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { groupApi } from "@/api";

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

type StatusFilter = "전체" | "INACTIVE" | "ACTIVE";

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
    queryFn: () => groupApi.getAll(),
  });

  const groups = useMemo(() => extractGroups(res?.data ?? null), [res]);

  const closedGroups = useMemo(
    () => groups.filter((g) => g.groupRecruitmentStatus === "CLOSED"),
    [groups],
  );

  const filtered = useMemo(() => {
    if (statusFilter === "전체") return closedGroups;
    return closedGroups.filter((g) => g.groupStatus === statusFilter);
  }, [closedGroups, statusFilter]);

  const approveMutation = useMutation({
    mutationFn: async (groupId: number) => {
      await groupApi.updateStatus(groupId, { groupStatus: "ACTIVE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups", "admin"] });
    },
  });

  const countByStatus = useMemo(() => {
    const inactive = closedGroups.filter((g) => g.groupStatus === "INACTIVE").length;
    const active = closedGroups.filter((g) => g.groupStatus === "ACTIVE").length;
    return { inactive, active, total: closedGroups.length };
  }, [closedGroups]);

  const statusFilters: { label: string; value: StatusFilter; count: number }[] =
    [
      { label: "전체", value: "전체", count: countByStatus.total },
      { label: "승인 대기", value: "INACTIVE", count: countByStatus.inactive },
      { label: "승인됨", value: "ACTIVE", count: countByStatus.active },
    ];

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
        그룹 관리
      </h1>

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
        <div className="py-12 text-center text-gray-500">
          해당 상태의 그룹이 없습니다.
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
                const isInactive = group.groupStatus === "INACTIVE";
                const isActive = group.groupStatus === "ACTIVE";
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
                        모집 마감
                      </span>
                    </td>
                    <td className="p-3 text-center text-gray-500">
                      {formatDate(group.createdAt)}
                    </td>
                    <td className="p-3 text-center">
                      {isInactive && (
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                          승인 대기 중
                        </span>
                      )}
                      {isActive && (
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                          승인됨
                        </span>
                      )}
                      {!isInactive && !isActive && (
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                          {group.groupStatus}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {isInactive ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            disabled={approveMutation.isPending}
                            onClick={() =>
                              approveMutation.mutate(group.groupId)
                            }
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
                          >
                            승인
                          </button>
                          <button
                            type="button"
                            disabled
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-200 text-gray-500 cursor-not-allowed"
                          >
                            거절
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
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

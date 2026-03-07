"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { groupApi } from "@/api";

export interface ApplicantItem {
  /** 수락/거절 API에 사용 */
  groupMemberId?: number;
  id?: number;
  memberId?: number;
  memberName?: string;
  authorName?: string;
  authorGeneration?: number;
  generation?: number;
  status?: string;
  appliedAt?: string;
  [key: string]: unknown;
}

interface ApplicantsModalProps {
  open: boolean;
  onClose: () => void;
  groupId: number;
  /** 모달 제목 (예: "프로젝트 신청 인원", "스터디 신청 인원") */
  title?: string;
}

/** 응답에서 신청자 배열 추출 */
function extractApplicants(raw: unknown): ApplicantItem[] {
  if (!raw || typeof raw !== "object") return [];
  const obj = raw as Record<string, unknown>;
  // { data: { content: [...] } } 또는 { data: [...] } 등
  const data = obj.data;
  if (Array.isArray(data)) return data as ApplicantItem[];
  if (data && typeof data === "object" && "content" in data) {
    const arr = (data as { content?: unknown }).content;
    return Array.isArray(arr) ? (arr as ApplicantItem[]) : [];
  }
  if (Array.isArray(obj.content)) return obj.content as ApplicantItem[];
  return [];
}

function getDisplayName(item: ApplicantItem): string {
  const name = item.memberName ?? item.authorName ?? item.name ?? "익명";
  const gen = item.authorGeneration ?? item.generation;
  return gen ? `${gen}기 ${name}` : (name as string);
}

export default function ApplicantsModal({
  open,
  onClose,
  groupId,
  title = "신청 인원",
}: ApplicantsModalProps) {
  const queryClient = useQueryClient();
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const {
    data: res,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["applicants", groupId],
    queryFn: () => groupApi.getApplicants(groupId),
    enabled: open && !!groupId,
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      groupMemberId,
      accept,
    }: {
      groupMemberId: number;
      accept: boolean;
    }) => {
      await groupApi.updateApplicant(groupMemberId, {
        status: accept ? "ACCEPTED" : "REJECTED",
      });
    },
    onMutate: ({ groupMemberId }) => setUpdatingId(groupMemberId),
    onSettled: () => setUpdatingId(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applicants", groupId] });
      refetch();
    },
  });

  const applicants = res?.data ? extractApplicants(res.data) : [];

  // PENDING 상태만 표시 (수락/거절 대기)
  const pendingApplicants = applicants.filter(
    (a) => !a.status || a.status === "PENDING" || a.status === "APPLIED",
  );

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-lg max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6" strokeWidth={2} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading && (
            <p className="text-center text-gray-500 py-8">로딩 중...</p>
          )}
          {isError && (
            <p className="text-center text-red-500 py-8">
              신청자 목록을 불러오지 못했습니다.
            </p>
          )}
          {!isLoading && !isError && pendingApplicants.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              대기 중인 신청자가 없습니다.
            </p>
          )}
          {!isLoading && !isError && pendingApplicants.length > 0 && (
            <ul className="space-y-3">
              {pendingApplicants.map((item) => {
                const gmid = (item.groupMemberId ??
                  item.id ??
                  item.memberId) as number | undefined;
                const isUpdating = gmid != null && updatingId === gmid;
                return (
                  <li
                    key={gmid ?? String(item)}
                    className="flex items-center justify-between gap-4 py-3 px-4 bg-gray-50 rounded-xl"
                  >
                    <span className="font-medium text-gray-900 truncate">
                      {getDisplayName(item)}
                    </span>
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => {
                          if (gmid == null) return;
                          updateMutation.mutate({
                            groupMemberId: gmid,
                            accept: true,
                          });
                        }}
                        className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-[#45CD89] text-white hover:opacity-90 disabled:opacity-50"
                      >
                        수락
                      </button>
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => {
                          if (gmid == null) return;
                          updateMutation.mutate({
                            groupMemberId: gmid,
                            accept: false,
                          });
                        }}
                        className="px-3 py-1.5 rounded-lg text-sm font-semibold border border-red-400 text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        거절
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { groupApi } from "@/api";

export interface ApplicantItem {
  groupMemberId?: number;
  id?: number;
  memberId?: number;
  userId?: number;
  userName?: string;
  memberName?: string;
  authorName?: string;
  authorGeneration?: number;
  generation?: number;
  /** 학과 (API에 있으면 표시) */
  department?: string;
  major?: string;
  /** 학년 (API에 있으면 표시) */
  grade?: number;
  groupMemberStatus?: string;
  status?: string;
  appliedAt?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export type ModalMode = "applicants" | "members";

interface ApplicantsModalProps {
  open: boolean;
  onClose: () => void;
  groupId: number;
  /** "applicants": PENDING 신청자 (수락/거부), "members": ACTIVE 현재 인원 (조회 전용) */
  mode?: ModalMode;
  /** 모집 중일 때만 하단 모집 마감 버튼 표시 */
  recruiting?: boolean;
  /** 모집 마감 확인 후 예 선택 시 호출 (그룹 생성 요청/마감 API 호출용) */
  onCloseRecruitment?: () => void;
}

/** 응답에서 신청자 배열 추출 (null/undefined/빈 구조 방어) */
function extractApplicants(raw: unknown): ApplicantItem[] {
  if (raw == null || typeof raw !== "object") return [];
  const obj = raw as Record<string, unknown>;
  const data = obj.data ?? obj.content ?? obj;
  if (data == null) return [];
  if (Array.isArray(data)) return data as ApplicantItem[];
  if (typeof data === "object" && "content" in data) {
    const arr = (data as { content?: unknown }).content;
    return Array.isArray(arr) ? (arr as ApplicantItem[]) : [];
  }
  return [];
}

function getDepartment(item: ApplicantItem): string {
  return (item.department ?? item.major ?? "-") as string;
}

function getGrade(item: ApplicantItem): string {
  const g = item.grade;
  return g != null ? String(g) : "-";
}

function getName(item: ApplicantItem): string {
  return (item.userName ?? item.memberName ?? item.authorName ?? item.name ?? "익명") as string;
}

export default function ApplicantsModal({
  open,
  onClose,
  groupId,
  mode = "applicants",
  recruiting = false,
  onCloseRecruitment,
}: ApplicantsModalProps) {
  const isApplicantsMode = mode === "applicants";
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
        action: accept ? "ACCEPT" : "REJECT",
      });
    },
    onMutate: ({ groupMemberId }) => setUpdatingId(groupMemberId),
    onSettled: () => setUpdatingId(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applicants", groupId] });
      queryClient.invalidateQueries({ queryKey: ["study"] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
      queryClient.invalidateQueries({ queryKey: ["myGroups"] });
      refetch();
    },
  });

  const applicants = extractApplicants(res?.data ?? res ?? null);
  const getStatus = (a: ApplicantItem) => a.groupMemberStatus ?? a.status;
  const filteredList = isApplicantsMode
    ? applicants.filter(
        (a) => !getStatus(a) || getStatus(a) === "PENDING" || getStatus(a) === "APPLIED",
      )
    : applicants.filter((a) => getStatus(a) === "ACTIVE");

  const handleCloseRecruitment = () => {
    const message = "이대로 마감하시겠습니까?";
    if (!window.confirm(message)) return;
    alert("그룹 생성을 요청하였습니다!");
    onCloseRecruitment?.();
    onClose();
  };

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
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
        className="relative w-full max-w-[692px] bg-white rounded-[40px] shadow-lg max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* X 닫기 */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-9 z-10 w-[39px] h-[39px] flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-[#3E434A]"
        >
          <X className="w-6 h-6" strokeWidth={2} />
        </button>

        {/* 상단: 제목 + 안내 */}
        <div className="flex flex-col items-center gap-10 pt-9 pb-4 px-6">
          <div className="flex flex-col items-center gap-3">
            <h2 className="text-center text-gray-900 text-xl font-semibold leading-8">
              {isApplicantsMode ? "신청 인원 확인" : "현재 인원 확인"}
            </h2>
            <p className="text-center text-[#54585E] text-base font-medium leading-[26px] max-w-[580px]">
              {isApplicantsMode ? (
                <>
                  이 프로젝트/스터디에 지원한 동아리원 목록을 보고{" "}
                  <span className="font-bold">수락</span> 또는{" "}
                  <span className="font-bold">거절</span>을 선택해주세요
                </>
              ) : (
                <></>
              )}
            </p>
          </div>
        </div>

        {/* 테이블: 헤더 + 행 */}
        <div className="flex-1 overflow-y-auto flex flex-col min-h-0 px-6">
          <div className="flex flex-col">
            {/* 헤더 */}
            <div className="flex px-5 py-3 bg-[rgba(149,198,116,0.22)] border-t border-b border-[#95C674] items-center gap-9">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-[146px] shrink-0 flex justify-center">
                  <span className="text-[#95C674] text-base font-bold">
                    학과
                  </span>
                </div>
                <div className="w-[146px] shrink-0 flex justify-center">
                  <span className="text-[#95C674] text-base font-bold">
                    학년
                  </span>
                </div>
                <div className="w-[146px] shrink-0 flex justify-center">
                  <span className="text-[#95C674] text-base font-bold">
                    이름
                  </span>
                </div>
              </div>
              {isApplicantsMode && (
                <div className="w-[146px] shrink-0 flex justify-center">
                  <span className="text-[#95C674] text-base font-bold">
                    수락여부
                  </span>
                </div>
              )}
            </div>

            {/* 본문 */}
            {isLoading && (
              <div className="py-12 text-center text-gray-500">로딩 중...</div>
            )}
            {isError && (
              <div className="py-12 text-center text-red-500">
                신청자 목록을 불러오지 못했습니다.
              </div>
            )}
            {!isLoading && !isError && filteredList.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                {isApplicantsMode ? "신청 인원이 없습니다." : "현재 활동 중인 인원이 없습니다."}
              </div>
            )}
            {!isLoading &&
              !isError &&
              filteredList.length > 0 &&
              filteredList.map((item) => {
                const gmid = (item.groupMemberId ??
                  item.id ??
                  item.memberId) as number | undefined;
                const isUpdating = gmid != null && updatingId === gmid;
                return (
                  <div
                    key={gmid ?? String(item)}
                    className="flex px-5 py-5 border-b border-[#C7CBD1] items-center gap-9"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-[146px] shrink-0 flex justify-center">
                        <span className="text-gray-900 text-base font-medium leading-[26px]">
                          {getDepartment(item)}
                        </span>
                      </div>
                      <div className="w-[146px] shrink-0 flex justify-center">
                        <span className="text-gray-900 text-base font-medium leading-[26px]">
                          {getGrade(item)}
                        </span>
                      </div>
                      <div className="w-[146px] shrink-0 flex justify-center">
                        <span className="text-gray-900 text-base font-medium leading-[26px]">
                          {getName(item)}
                        </span>
                      </div>
                    </div>
                    {isApplicantsMode && (
                      <div className="w-[146px] shrink-0 flex justify-center">
                        <div className="flex items-center gap-1">
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
                            className="px-3 py-2.5 rounded-xl text-sm font-semibold bg-[#45CD89] text-white hover:opacity-90 disabled:opacity-50"
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
                            className="px-3 py-2.5 rounded-xl text-sm font-semibold bg-[#FC5E6E] text-white hover:opacity-90 disabled:opacity-50"
                          >
                            거부
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* 하단 */}
        <div className="flex justify-center px-6 py-6 border-t border-gray-200">
          {isApplicantsMode && recruiting && onCloseRecruitment ? (
            <button
              type="button"
              onClick={handleCloseRecruitment}
              className="px-8 py-3 rounded-full font-semibold border-2 border-[#95C674] bg-[#95C674] text-white hover:opacity-90 transition-opacity"
            >
              모집 마감
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 rounded-full font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              닫기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

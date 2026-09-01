"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DetailTemplate from "@/components/detail/DetailTemplate";
import ApplicantsModal from "@/components/detail/ApplicantsModal";
import Sidebar from "@/components/shared/Sidebar";
import RequireMember from "@/components/auth/RequireMember";
import { useUserStore } from "@/store/userStore";
import { studyApi, groupApi } from "@/api";
import GroupRejectedBanner from "@/components/group/GroupRejectedBanner";
import { useGroupRejection } from "@/hooks/group";

const CATEGORIES = [
  { label: "전체", value: "전체" },
  { label: "C++", value: "C++" },
  { label: "Python", value: "Python" },
  { label: "Java", value: "Java" },
  { label: "알고리즘", value: "알고리즘" },
  { label: "기타", value: "기타" },
] as const;

function formatDate(iso?: string) {
  if (!iso) return "방금 전";
  try {
    const d = new Date(iso);
    return d
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

export default function StudyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const { name: currentUserName } = useUserStore();
  const queryClient = useQueryClient();

  const numericId = typeof id === "string" ? Number(id) : Number(id?.[0]);
  const [justApplied, setJustApplied] = useState(false);
  const [applicantsModalOpen, setApplicantsModalOpen] = useState(false);
  const [membersModalOpen, setMembersModalOpen] = useState(false);

  const {
    data: studyRes,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["study", numericId],
    queryFn: () => studyApi.getById(numericId),
    enabled: !!numericId && !Number.isNaN(numericId),
  });

  const study = studyRes?.data?.data;
  const groupId = study?.groupId;

  const activeMemberCount =
    (study as { activeMemberCount?: number })?.activeMemberCount ?? 0;

  const isAuthor =
    study?.leader ??
    study?.isAuthor ??
    (!!currentUserName &&
      !!study?.authorName &&
      study.authorName === currentUserName);

  const hasAppliedFromApi = study?.hasApplied ?? false;

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!numericId) return;
      await studyApi.delete(numericId);
    },
    // TODO: react-query v6 onSuccess/onError/onSettled deprecation - 마이그레이션 검토
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studies"] });
      router.push("/study");
    },
  });

  const { group, isRejected, resubmit, isResubmitting } = useGroupRejection({
    groupId,
    enabled: isAuthor,
    detailQueryKey: ["study", numericId],
  });

  const closeMutation = useMutation({
    mutationFn: async () => {
      if (!groupId) return;
      await groupApi.updateRecruitment(groupId, {
        groupRecruitmentStatus: "CLOSED",
      });
    },
    // TODO: react-query v6 onSuccess/onError/onSettled deprecation - 마이그레이션 검토
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study", numericId] });
      queryClient.invalidateQueries({ queryKey: ["studies"] });
      alert("모집이 마감되었습니다.");
    },
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!groupId) return;
      await groupApi.join(groupId);
    },
    // TODO: react-query v6 onSuccess/onError/onSettled deprecation - 마이그레이션 검토
    onSuccess: () => {
      setJustApplied(true);
      queryClient.invalidateQueries({ queryKey: ["study", numericId] });
      alert("스터디 신청이 완료되었습니다.");
    },
    onError: (err) => {
      queryClient.invalidateQueries({ queryKey: ["study", numericId] });
      // 중복 신청 말고도 재신청 횟수 초과 등 사유가 여럿이라 서버 문구를 그대로 쓴다
      alert(
        (err as Error)?.message ||
          "스터디 신청에 실패했습니다. 다시 시도해주세요.",
      );
    },
  });

  const cancelApplyMutation = useMutation({
    mutationFn: async () => {
      if (!groupId) return;
      await groupApi.leave(groupId);
    },
    // TODO: react-query v6 onSuccess/onError/onSettled deprecation - 마이그레이션 검토
    onSuccess: () => {
      setJustApplied(false);
      queryClient.invalidateQueries({ queryKey: ["study", numericId] });
      alert("스터디 신청이 취소되었습니다.");
    },
  });

  const handleShowApplicants = () => {
    if (groupId) setApplicantsModalOpen(true);
  };

  if (isLoading) {
    return (
      <RequireMember>
        <main className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-gray-500">로딩 중...</p>
        </main>
      </RequireMember>
    );
  }

  if (isError || !study) {
    return (
      <RequireMember>
        <main className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-red-500">게시글을 불러올 수 없습니다.</p>
        </main>
      </RequireMember>
    );
  }

  const authorDisplay = study.authorName
    ? study.authorGeneration
      ? `${study.authorGeneration}기 ${study.authorName}`
      : study.authorName
    : "익명";

  const statusKey = study.recruiting ? "recruiting" : "completed";

  const goEditPage = () => {
    const payload = {
      id: String(id),
      title: study.title,
      studyName: study.studyName,
      categories: study.studyTags,
      recruitStatus: study.recruiting ? "recruiting" : "completed",
      recruitCount: study.maxMembers,
      content: study.content,
    };
    sessionStorage.setItem("editPost_study", JSON.stringify(payload));
    router.push(`/study/write?id=${id}`);
  };

  return (
    <RequireMember>
      <main className="min-h-screen bg-white">
        <div className="flex">
          <Sidebar
            items={CATEGORIES}
            selected=""
            onSelect={(val) => router.push(`/study?category=${val}`)}
            writeLink="/study/write"
          />
          <DetailTemplate
            backPath="/study"
            title={study.title}
            status={isRejected ? "rejected" : statusKey}
            author={authorDisplay}
            date={formatDate(study.createdAt)}
            views={study.viewCount ?? 0}
            infoLabel="모집 분야"
            categories={study.studyTags ?? []}
            activeMemberCount={activeMemberCount}
            maxMembers={study.maxMembers}
            content={study.content}
            notice={
              isRejected && group ? (
                <GroupRejectedBanner
                  group={group}
                  onResubmit={resubmit}
                  onEdit={goEditPage}
                  isSubmitting={isResubmitting}
                />
              ) : undefined
            }
            onEdit={
              isAuthor
                ? () => {
                    if (!study.recruiting) {
                      alert("모집 완료된 글은 수정할 수 없습니다.");
                      return;
                    }
                    goEditPage();
                  }
                : undefined
            }
            onDelete={
              isAuthor
                ? () => {
                    if (!numericId) return;
                    if (window.confirm("이 스터디 모집 글을 삭제할까요?")) {
                      deleteMutation.mutate();
                    }
                  }
                : undefined
            }
            footer={
              isAuthor ? (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleShowApplicants}
                    className="flex items-center justify-center px-5 py-2 gap-[7px] rounded-full border-2 border-brand bg-white text-brand text-base font-semibold hover:bg-(--Brand-100,#F4F9F1) transition-all duration-200"
                  >
                    신청 인원 확인
                  </button>
                  <button
                    type="button"
                    onClick={() => groupId && setMembersModalOpen(true)}
                    className="flex items-center justify-center px-5 py-2 gap-[7px] rounded-full border-2 border-gray-300 bg-white text-gray-700 text-base font-semibold hover:bg-gray-50 transition-all duration-200"
                  >
                    현재 인원 확인
                  </button>
                </div>
              ) : justApplied || hasAppliedFromApi ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!groupId) return;
                    if (window.confirm("이 스터디 신청을 취소할까요?")) {
                      cancelApplyMutation.mutate();
                    }
                  }}
                  className="flex items-center justify-center px-5 py-2 gap-[7px] rounded-full border-2 border-gray-300 bg-white text-gray-600 text-base font-semibold hover:bg-gray-50 transition-all duration-200"
                >
                  신청 취소
                </button>
              ) : !study.recruiting ? (
                <span className="flex items-center justify-center px-5 py-2 rounded-full border-2 border-gray-200 bg-gray-50 text-gray-500 text-base font-semibold cursor-not-allowed">
                  모집 마감
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (!groupId) return;
                    if (window.confirm("이 스터디에 신청하시겠습니까?")) {
                      applyMutation.mutate();
                    }
                  }}
                  className="flex items-center justify-center px-5 py-2 gap-[7px] rounded-full border-2 border-brand bg-white text-brand text-base font-semibold hover:bg-(--Brand-100,#F4F9F1) transition-all duration-200"
                >
                  신청하기
                </button>
              )
            }
          />
        </div>
        {groupId && (
          <>
            <ApplicantsModal
              open={applicantsModalOpen}
              onClose={() => setApplicantsModalOpen(false)}
              groupId={groupId}
              mode="applicants"
              recruiting={study.recruiting}
              onCloseRecruitment={() => closeMutation.mutate()}
            />
            <ApplicantsModal
              open={membersModalOpen}
              onClose={() => setMembersModalOpen(false)}
              groupId={groupId}
              mode="members"
            />
          </>
        )}
      </main>
    </RequireMember>
  );
}

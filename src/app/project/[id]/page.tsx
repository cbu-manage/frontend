"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DetailTemplate from "@/components/detail/DetailTemplate";
import ApplicantsModal from "@/components/detail/ApplicantsModal";
import Sidebar from "@/components/shared/Sidebar";
import RequireMember from "@/components/auth/RequireMember";
import { useUserStore } from "@/store/userStore";
import { projectApi, groupApi } from "@/api";

/** getMyApplications 응답에서 groupId에 해당하는 myStatus 추출 */
function getMyStatusForGroup(raw: unknown, groupId: number): "PENDING" | "ACTIVE" | "REJECTED" | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const data = obj.data ?? obj;
  const list = Array.isArray(data) ? data : (data && typeof data === "object" && "content" in data) ? (data as { content?: unknown }).content ?? [] : [];
  if (!Array.isArray(list)) return null;
  for (const item of list) {
    const i = item as Record<string, unknown>;
    const gid = (i.groupId as number) ?? 0;
    if (gid === groupId) {
      const status = (i.myStatus ?? i.status) as string | undefined;
      if (status === "ACTIVE" || status === "APPROVED") return "ACTIVE";
      if (status === "REJECTED") return "REJECTED";
      if (status === "PENDING" || status === "APPLIED") return "PENDING";
      return null;
    }
  }
  return null;
}

/** API enum → 한글 (상세/카드 표시용) */
const ENUM_TO_LABEL: Record<string, string> = {
  BACKEND: "백엔드",
  FRONTEND: "프론트엔드",
  DEV: "개발",
  PLANNING: "기획",
  DESIGN: "디자인",
  ETC: "기타",
};

const POSITIONS = [
  { label: "전체", value: "전체" },
  { label: "프론트엔드", value: "프론트엔드" },
  { label: "백엔드", value: "백엔드" },
  { label: "개발", value: "개발" },
  { label: "디자인", value: "디자인" },
  { label: "기획", value: "기획" },
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

export default function ProjectDetailPage() {
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
    data: projectRes,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["project", numericId],
    queryFn: () => projectApi.getById(numericId),
    enabled: !!numericId && !Number.isNaN(numericId),
  });

  const rawData = projectRes?.data;
  const projectData = (
    rawData && typeof rawData === "object" && "data" in rawData
      ? (rawData as { data?: unknown }).data
      : rawData
  ) as
    | {
        postId?: number;
        authorId?: number;
        title?: string;
        content?: string;
        recruitmentFields?: string[];
        recruiting?: boolean;
        createdAt?: string;
        deadline?: string;
        activeMemberCount?: number;
        maxMembers?: number;
        groupId?: number;
        authorGeneration?: number;
        authorName?: string;
        viewCount?: number;
        leader?: boolean;
        isLeader?: boolean;
        hasApplied?: boolean;
      }
    | null
    | undefined;

  const groupId = projectData?.groupId;
  const isLeader =
    projectData?.leader ??
    projectData?.isLeader ??
    (!!currentUserName &&
      !!projectData?.authorName &&
      projectData.authorName === currentUserName);

  const { data: myApplicationsRes } = useQuery({
    queryKey: ["groups", "my", "applications", 2, 0],
    queryFn: () =>
      groupApi.getMyApplications({ page: 0, size: 50, category: 2 }),
    enabled: !!groupId && !isLeader,
  });

  const myStatus = useMemo(() => {
    if (!groupId) return null;
    const raw = myApplicationsRes?.data ?? myApplicationsRes;
    return getMyStatusForGroup(raw, groupId);
  }, [groupId, myApplicationsRes]);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!numericId) return;
      await projectApi.delete(numericId);
    },
    // TODO: react-query v6 onSuccess/onError/onSettled deprecation - 마이그레이션 검토
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      router.push("/project");
    },
  });

  const closeMutation = useMutation({
    mutationFn: async () => {
      if (!groupId) return;
      await groupApi.updateRecruitment(groupId, { groupRecruitmentStatus: "CLOSED" });
    },
    // TODO: react-query v6 onSuccess/onError/onSettled deprecation - 마이그레이션 검토
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", numericId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
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
      queryClient.invalidateQueries({ queryKey: ["project", numericId] });
      queryClient.invalidateQueries({ queryKey: ["groups", "my", "applications"] });
      alert("프로젝트 신청이 완료되었습니다.");
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["project", numericId] });
      alert("이미 들어간 프로젝트입니다.");
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
      queryClient.invalidateQueries({ queryKey: ["project", numericId] });
      queryClient.invalidateQueries({ queryKey: ["groups", "my", "applications"] });
      alert("프로젝트 신청이 취소되었습니다.");
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

  if (isError || !projectData) {
    return (
      <RequireMember>
        <main className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-red-500">게시글을 불러올 수 없습니다.</p>
        </main>
      </RequireMember>
    );
  }

  const authorDisplay = projectData.authorName
    ? projectData.authorGeneration
      ? `${projectData.authorGeneration}기 ${projectData.authorName}`
      : projectData.authorName
    : "익명";

  const statusKey = projectData.recruiting ? "recruiting" : "completed";
  const categories = (projectData.recruitmentFields ?? []).map(
    (e) => ENUM_TO_LABEL[e] ?? e,
  );

  const activeMemberCount =
    (projectData as { activeMemberCount?: number })?.activeMemberCount ?? 0;

  return (
    <RequireMember>
      <main className="min-h-screen bg-white">
        <div className="flex">
          <Sidebar
            items={POSITIONS}
            selected=""
            onSelect={(val) => router.push(`/project?position=${val}`)}
            writeLink="/project/write"
          />
          <DetailTemplate
            backPath="/project"
            title={projectData.title ?? ""}
            status={statusKey}
            author={authorDisplay}
            date={formatDate(projectData.createdAt)}
            views={projectData.viewCount ?? 0}
            infoLabel="모집 분야"
            categories={categories}
            activeMemberCount={activeMemberCount}
            maxMembers={projectData?.maxMembers}
            deadline={projectData?.deadline}
            content={projectData.content ?? ""}
            onEdit={
              isLeader
                ? () => {
                    if (!projectData.recruiting) {
                      alert("모집 완료된 글은 수정할 수 없습니다.");
                      return;
                    }
                    router.push(`/project/write?id=${id}`);
                  }
                : undefined
            }
            onDelete={
              isLeader
                ? () => {
                    if (!numericId) return;
                    if (window.confirm("이 프로젝트 모집 글을 삭제할까요?")) {
                      deleteMutation.mutate();
                    }
                  }
                : undefined
            }
            footer={
              isLeader ? (
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
              ) : justApplied || myStatus === "PENDING" || myStatus === "ACTIVE" || projectData?.hasApplied ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!groupId) return;
                    if (window.confirm("이 프로젝트 신청을 취소할까요?")) {
                      cancelApplyMutation.mutate();
                    }
                  }}
                  className="flex items-center justify-center px-5 py-2 gap-[7px] rounded-full border-2 border-gray-300 bg-white text-gray-600 text-base font-semibold hover:bg-gray-50 transition-all duration-200"
                >
                  신청 취소
                </button>
              ) : !projectData?.recruiting ? (
                <span className="flex items-center justify-center px-5 py-2 rounded-full border-2 border-gray-200 bg-gray-50 text-gray-500 text-base font-semibold cursor-not-allowed">
                  모집 마감
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (!groupId) return;
                    if (window.confirm("이 프로젝트에 신청하시겠습니까?")) {
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
              recruiting={projectData.recruiting}
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

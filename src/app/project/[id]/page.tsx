"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DetailTemplate from "@/components/detail/DetailTemplate";
import Sidebar from "@/components/shared/Sidebar";
import RequireMember from "@/components/auth/RequireMember";
import { useUserStore } from "@/store/userStore";
import { projectApi, groupApi } from "@/api";

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
  const [hasApplied, setHasApplied] = useState(false);

  const { data: projectRes, isLoading, isError } = useQuery({
    queryKey: ["project", numericId],
    queryFn: () => projectApi.getById(numericId),
    enabled: !!numericId && !Number.isNaN(numericId),
  });

  const { data: myGroupsRes } = useQuery({
    queryKey: ["myGroups"],
    queryFn: () => groupApi.getMyGroups(),
    enabled: !!currentUserName,
  });

  const rawData = projectRes?.data;
  const projectData = (
    rawData && typeof rawData === "object" && "data" in rawData
      ? (rawData as { data?: unknown }).data
      : rawData
  ) as {
    postId?: number;
    authorId?: number;
    title?: string;
    content?: string;
    recruitmentFields?: string[];
    recruiting?: boolean;
    createdAt?: string;
    deadline?: string;
    maxMember?: number;
    groupId?: number;
    authorGeneration?: number;
    authorName?: string;
    viewCount?: number;
    isLeader?: boolean;
    hasApplied?: boolean;
  } | null | undefined;

  const groupId = projectData?.groupId;
  const isLeader = projectData?.isLeader ?? false;
  const hasAppliedFromApi = projectData?.hasApplied ?? false;

  const appliedStatus = useMemo(() => {
    if (!groupId || !myGroupsRes?.data) return null;
    const raw = myGroupsRes.data;
    const list = Array.isArray(raw) ? raw : (raw as { data?: unknown[] })?.data ?? [];
    const found = list.find(
      (g: { groupId?: number }) => (g as { groupId?: number }).groupId === groupId
    );
    return found ? (found as { status?: string }).status : null;
  }, [groupId, myGroupsRes]);

  const isApplied =
    hasApplied ||
    hasAppliedFromApi ||
    appliedStatus === "PENDING" ||
    appliedStatus === "ACTIVE";

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!numericId) return;
      await projectApi.delete(numericId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      router.push("/project");
    },
  });

  const closeMutation = useMutation({
    mutationFn: async () => {
      if (!numericId) return;
      await projectApi.close(numericId);
    },
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
    onSuccess: () => {
      setHasApplied(true);
      queryClient.invalidateQueries({ queryKey: ["myGroups"] });
      queryClient.invalidateQueries({ queryKey: ["project", numericId] });
      alert("프로젝트 신청이 완료되었습니다.");
    },
  });

  const cancelApplyMutation = useMutation({
    mutationFn: async () => {
      if (!groupId) return;
      await groupApi.leave(groupId);
    },
    onSuccess: () => {
      setHasApplied(false);
      queryClient.invalidateQueries({ queryKey: ["myGroups"] });
      queryClient.invalidateQueries({ queryKey: ["project", numericId] });
      alert("프로젝트 신청이 취소되었습니다.");
    },
  });

  const handleShowApplicants = async () => {
    if (!groupId) return;
    try {
      const res = await groupApi.getApplicants(groupId);
      console.log("신청자 목록", res.data);
      alert("신청자 목록은 콘솔에서 확인할 수 있습니다.");
    } catch (err) {
      console.error(err);
      alert("신청자 목록을 불러오지 못했습니다.");
    }
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
    (e) => ENUM_TO_LABEL[e] ?? e
  );

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
          content={projectData.content ?? ""}
          onEdit={
            isLeader
              ? () => router.push(`/project/write?id=${id}`)
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
                {projectData.recruiting && (
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          "모집을 마감하면 더 이상 신청을 받을 수 없습니다. 계속할까요?",
                        )
                      ) {
                        closeMutation.mutate();
                      }
                    }}
                    className="flex items-center justify-center px-5 py-2 gap-[7px] rounded-full border-2 border-brand bg-brand text-white text-base font-semibold hover:opacity-90 transition-all duration-200"
                  >
                    모집 마감
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (!groupId) return;
                  if (isApplied) {
                    if (window.confirm("이 프로젝트 신청을 취소할까요?")) {
                      cancelApplyMutation.mutate();
                    }
                  } else {
                    if (window.confirm("이 프로젝트에 신청하시겠습니까?")) {
                      applyMutation.mutate();
                    }
                  }
                }}
                className="flex items-center justify-center px-5 py-2 gap-[7px] rounded-full border-2 border-brand bg-white text-brand text-base font-semibold hover:bg-(--Brand-100,#F4F9F1) transition-all duration-200"
              >
                {isApplied ? "신청 취소" : "신청하기"}
              </button>
            )
          }
        />
      </div>
      </main>
    </RequireMember>
  );
}

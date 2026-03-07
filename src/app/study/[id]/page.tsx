"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DetailTemplate from "@/components/detail/DetailTemplate";
import Sidebar from "@/components/shared/Sidebar";
import RequireMember from "@/components/auth/RequireMember";
import { useUserStore } from "@/store/userStore";
import { studyApi, groupApi } from "@/api";

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
    return d.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).replace(/\. /g, ". ");
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
  const [hasApplied, setHasApplied] = useState(false);

  const { data: studyRes, isLoading, isError } = useQuery({
    queryKey: ["study", numericId],
    queryFn: () => studyApi.getById(numericId),
    enabled: !!numericId && !Number.isNaN(numericId),
  });

  const { data: myGroupsRes } = useQuery({
    queryKey: ["myGroups"],
    queryFn: () => groupApi.getMyGroups(),
    enabled: !!currentUserName && !!studyRes?.data?.data?.groupId,
  });

  const study = studyRes?.data?.data;
  const groupId = study?.groupId;

  // 백엔드가 isAuthor를 안 주거나 false면 authorName으로 fallback
  const isAuthor =
    study?.isAuthor ??
    (!!currentUserName && !!study?.authorName && study.authorName === currentUserName);

  const appliedStatus = useMemo(() => {
    if (!groupId || !myGroupsRes?.data) return null;
    const raw = myGroupsRes.data;
    const list = Array.isArray(raw) ? raw : (raw as { data?: unknown[] })?.data ?? [];
    const found = (list as { groupId?: number; status?: string }[]).find(
      (g) => g.groupId === groupId
    );
    return found?.status ?? null;
  }, [groupId, myGroupsRes]);

  const isApplied = hasApplied || appliedStatus === "PENDING" || appliedStatus === "ACTIVE";

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!numericId) return;
      await studyApi.delete(numericId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studies"] });
      router.push("/study");
    },
  });

  const closeMutation = useMutation({
    mutationFn: async () => {
      if (!numericId) return;
      await studyApi.close(numericId);
    },
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
    onSuccess: () => {
      setHasApplied(true);
      queryClient.invalidateQueries({ queryKey: ["myGroups"] });
      queryClient.invalidateQueries({ queryKey: ["study", numericId] });
      alert("스터디 신청이 완료되었습니다.");
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
      queryClient.invalidateQueries({ queryKey: ["study", numericId] });
      alert("스터디 신청이 취소되었습니다.");
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
    ? (study.authorGeneration ? `${study.authorGeneration}기 ${study.authorName}` : study.authorName)
    : "익명";

  const statusKey = study.recruiting ? "recruiting" : "completed";

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
          status={statusKey}
          author={authorDisplay}
          date={formatDate(study.createdAt)}
          views={study.viewCount ?? 0}
          infoLabel="모집 분야"
          categories={study.studyTags ?? []}
          content={study.content}
          onEdit={
            isAuthor
              ? () => {
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
                {study.recruiting && (
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
                    if (window.confirm("이 스터디 신청을 취소할까요?")) {
                      cancelApplyMutation.mutate();
                    }
                  } else {
                    if (window.confirm("이 스터디에 신청하시겠습니까?")) {
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

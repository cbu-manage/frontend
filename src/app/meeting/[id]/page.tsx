"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, Clock, Eye, MapPin } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import RequireMember from "@/components/auth/RequireMember";
import KebabMenu from "@/components/common/KebabMenu";
import Mascot, { type MascotEmotion } from "@/components/common/Mascot";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  useGathering,
  useAttendance,
  useVoteGathering,
  useDeleteGathering,
  useCloseGathering,
  useCanManageGathering,
} from "@/hooks/meeting";
import {
  gatheringApi,
  GATHERING_TYPE_LABEL,
  type GatheringMember,
  type AttendanceVote,
} from "@/api";

function fmt(iso?: string, pattern = "yyyy.MM.dd (EEE) HH:mm") {
  if (!iso) return "-";
  try {
    return format(new Date(iso), pattern, { locale: ko });
  } catch {
    return iso;
  }
}

// 참석 투표 (참석 / 불참)
const VOTE_OPTIONS: {
  key: AttendanceVote;
  label: string;
  emotion: MascotEmotion;
}[] = [
  { key: "ATTENDING", label: "참석할게요", emotion: "default" },
  { key: "NOT_ATTENDING", label: "참석이 어려워요", emotion: "sad" },
];

function MemberList({ members }: { members: GatheringMember[] }) {
  if (members.length === 0) {
    return <p className="mt-4 text-sm text-gray-400">아직 없어요</p>;
  }
  return (
    <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
      {members.map((m) => (
        <div key={m.memberId} className="flex items-center gap-2">
          <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
            {m.generation}기
          </span>
          <span className="text-sm text-gray-700">{m.name}</span>
        </div>
      ))}
    </div>
  );
}

export default function MeetingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);
  const canManage = useCanManageGathering(); // 수정/삭제/마감 + 참석명단 엑셀
  // ⚠️ 엑셀·관리자명단은 BE가 현재 ADMIN만 허용 → 운영진 확대는 BE 요청 필요

  const { data: meeting, isLoading, isError } = useGathering(id || null);
  const { data: attendance } = useAttendance(id || null);
  const voteMutation = useVoteGathering(id);
  const deleteMutation = useDeleteGathering();
  const closeMutation = useCloseGathering(id);

  // 내 기존 투표를 기본 선택으로 파생, 사용자가 바꾸면 override 우선
  const [choiceOverride, setChoiceOverride] = useState<AttendanceVote | null>(
    null,
  );

  if (isLoading) {
    return (
      <RequireMember>
        <main className="container-x-lg py-20 text-center text-gray-400">
          모임을 불러오는 중...
        </main>
      </RequireMember>
    );
  }
  if (isError || !meeting) {
    return (
      <RequireMember>
        <main className="container-x-lg py-20 text-center text-red-500">
          <p>모임을 불러오지 못했습니다.</p>
          <button
            onClick={() => router.push("/meeting")}
            className="mt-3 text-sm text-gray-500 underline"
          >
            목록으로
          </button>
        </main>
      </RequireMember>
    );
  }

  const defaultChoice: AttendanceVote | null =
    meeting.myStatus === "ATTENDING" || meeting.myStatus === "NOT_ATTENDING"
      ? meeting.myStatus
      : null;
  const choice = choiceOverride ?? defaultChoice;

  const handleDelete = () => {
    if (!window.confirm("이 모임을 삭제할까요?")) return;
    deleteMutation.mutate(id, {
      onSuccess: () => router.push("/meeting"),
      onError: () => alert("삭제 중 오류가 발생했습니다. 다시 시도해주세요."),
    });
  };

  const handleClose = () => {
    if (
      !window.confirm("투표를 마감할까요? 마감 후에는 응답을 받을 수 없어요.")
    )
      return;
    closeMutation.mutate(undefined, {
      onError: () => alert("마감 중 오류가 발생했습니다. 다시 시도해주세요."),
    });
  };

  const handleVote = () => {
    if (!choice) return;
    voteMutation.mutate(choice, {
      onError: () =>
        alert("투표 저장 중 오류가 발생했습니다. 다시 시도해주세요."),
    });
  };

  // 참석 명단 엑셀 다운로드 (ADMIN 전용)
  const handleExport = async () => {
    try {
      const res = await gatheringApi.exportAttendance(id);
      const url = URL.createObjectURL(res.data as Blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${meeting.title}_참석명단.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("명단 다운로드에 실패했습니다.");
    }
  };

  return (
    <RequireMember>
      <main className="min-h-screen pb-16 bg-white">
        <div className="container-x-lg">
          <div className="pt-6 lg:pt-12">
            {/* 상단 바 */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => router.push("/meeting")}
                className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-5 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-50"
              >
                <ChevronLeft size={16} /> 목록으로
              </button>
              {canManage && (
                <KebabMenu
                  onEdit={() => router.push(`/meeting/write?id=${id}`)}
                  onDelete={handleDelete}
                />
              )}
            </div>

            {/* 분류 / 상태 / 제목 / 작성자 / 메타 */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-500">
                {GATHERING_TYPE_LABEL[meeting.type]}
              </span>
              <StatusBadge tone={meeting.voteClosed ? "danger" : "success"}>
                {meeting.voteClosed ? "모집 완료" : "모집 중"}
              </StatusBadge>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              {meeting.title}
            </h1>
            <p className="mt-3 text-base text-gray-600">
              {meeting.authorGeneration}기 {meeting.authorName}
            </p>
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Clock size={14} /> {fmt(meeting.createdAt, "yyyy.MM.dd")}
              </span>
              <span className="flex items-center gap-1">
                <Eye size={14} /> {meeting.viewCount}
              </span>
            </div>

            {/* 시간 / 장소 */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-4 rounded-2xl border border-gray-200 px-5 py-4 text-sm">
                <span className="flex items-center gap-2 font-medium text-gray-700">
                  <Clock size={16} className="text-gray-400" /> 시간
                </span>
                <span className="h-4 w-px bg-gray-200" />
                <span className="text-gray-900">
                  {fmt(meeting.gatheringDate)}
                </span>
              </div>
              <div className="flex items-center gap-4 rounded-2xl border border-gray-200 px-5 py-4 text-sm">
                <span className="flex items-center gap-2 font-medium text-gray-700">
                  <MapPin size={16} className="text-gray-400" /> 장소
                </span>
                <span className="h-4 w-px bg-gray-200" />
                <span className="text-gray-900">{meeting.location || "-"}</span>
              </div>
            </div>

            {/* 본문 */}
            <div className="whitespace-pre-wrap border-t border-gray-200 mt-6 py-10 text-base leading-relaxed text-gray-900">
              {meeting.description}
            </div>

            {/* 응답 마감 + 운영진 마감 버튼 */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-6 text-sm text-gray-700">
              <span className="flex items-center gap-1">
                <Clock size={16} /> 응답 마감 {fmt(meeting.voteDeadline)}
              </span>
              <div className="flex items-center gap-2">
                {canManage && (
                  <button
                    type="button"
                    onClick={handleExport}
                    className="rounded-full border border-gray-200 px-4 py-2 text-xs text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    명단 엑셀
                  </button>
                )}
                {canManage && !meeting.voteClosed && (
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={closeMutation.isPending}
                    className="rounded-full border border-gray-200 px-4 py-2 text-xs text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
                  >
                    {closeMutation.isPending ? "마감 중..." : "투표 마감"}
                  </button>
                )}
              </div>
            </div>

            {/* 참석 투표 */}
            <section className="mt-8 rounded-2xl bg-gray-50 p-8">
              <p className="text-sm font-semibold text-success">Vote</p>
              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                참석 여부를 알려주세요.
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                {meeting.voteClosed
                  ? "마감된 모임이에요. 응답 결과만 볼 수 있어요."
                  : "참석 여부는 아래 버튼으로 투표해주세요 (초록 버튼 = 현재 선택)"}
              </p>

              {!meeting.voteClosed && (
                <>
                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {VOTE_OPTIONS.map((opt) => {
                      const selected = choice === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setChoiceOverride(opt.key)}
                          className={`flex flex-col items-center gap-3 rounded-2xl border-2 py-8 transition-colors ${
                            selected
                              ? "border-success bg-success/10"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <Mascot emotion={opt.emotion} size="sm" decorative />
                          <span className="text-title-lg text-gray-900">
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    disabled={!choice || voteMutation.isPending}
                    onClick={handleVote}
                    className="mt-4 w-full rounded-full bg-gradient-to-b from-mascot-from to-mascot-to py-4 text-headline-sm text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {voteMutation.isPending ? "제출 중..." : "제출하기"}
                  </button>
                </>
              )}

              {/* 응답 명단 */}
              {attendance && (
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[
                    {
                      ko: "참석 가능",
                      en: "Approval",
                      tone: "text-success",
                      list: attendance.attendingMembers,
                    },
                    {
                      ko: "참석 불가능",
                      en: "Negative",
                      tone: "text-danger",
                      list: attendance.notAttendingMembers,
                    },
                  ].map((g) => (
                    <div
                      key={g.en}
                      className="rounded-2xl border border-gray-100 bg-white p-5"
                    >
                      <div className="flex items-baseline justify-between">
                        <div>
                          <p className={`text-sm font-bold ${g.tone}`}>
                            {g.en}
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {g.ko}
                          </p>
                        </div>
                        <span className="text-lg font-bold text-gray-900">
                          {g.list.length}명
                        </span>
                      </div>
                      <MemberList members={g.list} />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </RequireMember>
  );
}

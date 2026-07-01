"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import RequireMember from "@/components/auth/RequireMember";
import Mascot from "@/components/common/Mascot";
import {
  useGathering,
  useCreateGathering,
  useUpdateGathering,
  useCanManageGathering,
} from "@/hooks/meeting";
import type { GatheringType } from "@/api";

const TYPE_OPTIONS: { value: GatheringType; label: string }[] = [
  { value: "OTHER", label: "모임" },
  { value: "MT", label: "MT" },
  { value: "DINING", label: "회식" },
  { value: "FAIR", label: "박람회" },
  { value: "EVENT", label: "행사" },
];

/** datetime-local ↔ ISO 변환용 (앞 16자: yyyy-MM-ddTHH:mm) */
const toLocalInput = (iso?: string) => (iso ? iso.slice(0, 16) : "");

function MeetingWriteInner() {
  const router = useRouter();
  const canManage = useCanManageGathering();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEdit = editId != null;
  const gatheringId = isEdit ? Number(editId) : null;

  const { data: existing } = useGathering(gatheringId);
  const createMutation = useCreateGathering();
  const updateMutation = useUpdateGathering(gatheringId ?? -1);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<GatheringType | "">("");
  const [gatheringDate, setGatheringDate] = useState("");
  const [voteDeadline, setVoteDeadline] = useState("");
  const [location, setLocation] = useState("");
  const [allMembersTarget, setAllMembersTarget] = useState(true);
  const [description, setDescription] = useState("");

  // 수정 진입 시 기존 값 채우기 (effect 내 동기 setState 회피 위해 microtask)
  useEffect(() => {
    if (!existing) return;
    queueMicrotask(() => {
      setTitle(existing.title);
      setType(existing.type);
      setGatheringDate(toLocalInput(existing.gatheringDate));
      setVoteDeadline(toLocalInput(existing.voteDeadline));
      setLocation(existing.location ?? "");
      setAllMembersTarget(existing.allMembersTarget);
      setDescription(existing.description ?? "");
    });
  }, [existing]);

  const canSubmit = title && type && gatheringDate && voteDeadline;
  const pending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = () => {
    if (!canSubmit || !type) return;
    const base = {
      title,
      type,
      description,
      gatheringDate,
      location,
      voteDeadline,
    };
    if (isEdit) {
      updateMutation.mutate(base, {
        onSuccess: () => router.push(`/meeting/${gatheringId}`),
        onError: () => alert("수정 중 오류가 발생했습니다."),
      });
    } else {
      createMutation.mutate(
        { ...base, allMembersTarget },
        {
          onSuccess: () => router.push("/meeting"),
          onError: () => alert("등록 중 오류가 발생했습니다."),
        },
      );
    }
  };

  // 운영진만 등록/수정 가능
  if (!canManage) {
    return (
      <RequireMember>
        <main className="container-x-lg flex min-h-[60vh] flex-col items-center justify-center text-center">
          <Mascot emotion="sad" size="md" />
          <h1 className="mt-6 text-xl font-bold text-gray-900">
            운영진만 등록할 수 있어요
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            모임 일정은 운영진이 등록합니다.
          </p>
          <button
            onClick={() => router.push("/meeting")}
            className="mt-6 rounded-full border border-gray-200 px-6 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-50"
          >
            목록으로
          </button>
        </main>
      </RequireMember>
    );
  }

  return (
    <RequireMember>
      <main className="min-h-screen pb-16 bg-white">
        <div className="container-x-lg pt-6 lg:pt-12">
          <nav className="text-sm text-gray-400">
            <button
              onClick={() => router.push("/meeting")}
              className="hover:text-gray-600"
            >
              모임
            </button>
            <span className="mx-1.5">›</span>
            <span className="text-gray-600">
              {isEdit ? "모임 수정" : "새 모임 등록"}
            </span>
          </nav>
          <div className="mt-2 flex items-end justify-between border-b border-gray-900 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEdit ? "모임 수정" : "새 모임 등록"}
              </h1>
              <p className="mt-1 text-sm text-gray-400">
                운영진만 등록 가능 · 등록 시 전 회원에게 알림
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 p-6">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={50}
              placeholder="모임명을 입력하세요 (예: 2026 봄학기 신입 환영회)"
              className="w-full rounded-xl bg-gray-50 px-5 py-4 text-base text-gray-900 placeholder-gray-400 focus:outline-none"
            />

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* 카테고리 */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  카테고리
                </label>
                <div className="relative">
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as GatheringType)}
                    className={`w-full appearance-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none ${
                      type ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    <option value="" disabled>
                      카테고리를 선택해주세요
                    </option>
                    {TYPE_OPTIONS.map((c) => (
                      <option
                        key={c.value}
                        value={c.value}
                        className="text-gray-900"
                      >
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={18}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>

              {/* 모임 일시 */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  모임 일시
                </label>
                <input
                  type="datetime-local"
                  value={gatheringDate}
                  onChange={(e) => setGatheringDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none"
                />
              </div>

              {/* 응답 마감 */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  응답 마감
                </label>
                <input
                  type="datetime-local"
                  value={voteDeadline}
                  onChange={(e) => setVoteDeadline(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none"
                />
              </div>

              {/* 장소 */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  장소
                </label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="장소를 입력해 주세요."
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
                />
              </div>
            </div>

            {/* 전 회원 대상 (등록 시에만) */}
            {!isEdit && (
              <label className="mt-6 flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={allMembersTarget}
                  onChange={(e) => setAllMembersTarget(e.target.checked)}
                  className="size-4 accent-brand"
                />
                전 회원 대상 모임
              </label>
            )}
          </div>

          {/* 본문 */}
          <div className="mt-6 rounded-2xl border border-gray-200 p-6">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={10000}
              rows={14}
              placeholder="모임 설명, 장소 상세, 회비, 준비물 등을 자유롭게 입력하세요…"
              className="w-full resize-none text-sm leading-relaxed text-gray-900 placeholder-gray-400 focus:outline-none"
            />
            <div className="mt-2 text-right text-xs text-gray-400">
              {description.length} / 10,000
            </div>
          </div>

          {/* 푸터 */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/meeting")}
              className="rounded-full border border-gray-200 px-6 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="button"
              disabled={!canSubmit || pending}
              onClick={handleSubmit}
              className="rounded-full bg-gray-800 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-700 disabled:opacity-40"
            >
              {pending ? "저장 중..." : isEdit ? "수정하기" : "게시하기"}
            </button>
          </div>
        </div>
      </main>
    </RequireMember>
  );
}

export default function MeetingWritePage() {
  return (
    <Suspense fallback={null}>
      <MeetingWriteInner />
    </Suspense>
  );
}

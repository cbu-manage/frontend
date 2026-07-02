"use client";

import { useState } from "react";
import { AxiosError } from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { recruitmentApi, settingsApi, type OnboardingLinks } from "@/api";
import { useCan } from "@/hooks/auth";
import { formatDate } from "@/lib/date";

const EMPTY_LINKS: OnboardingLinks = {
  frontendUrl: "",
  openChatUrl: "",
  discordUrl: "",
};

const LINK_FIELDS: {
  key: keyof OnboardingLinks;
  label: string;
  placeholder: string;
}[] = [
  {
    key: "frontendUrl",
    label: "홈페이지",
    placeholder: "https://tukcbu.com",
  },
  {
    key: "openChatUrl",
    label: "카카오 오픈채팅",
    placeholder: "https://open.kakao.com/o/...",
  },
  {
    key: "discordUrl",
    label: "디스코드",
    placeholder: "https://discord.gg/...",
  },
];

function isValidUrl(value: string): boolean {
  return /^https?:\/\/.+/.test(value.trim());
}

export default function ClubScheduleSettingsSection() {
  const queryClient = useQueryClient();
  const canManageRecruitment = useCan("recruitment.manage");
  const canEditSettings = useCan("system.settings");

  // ── 모집 관리 ──────────────────────────────────────────────
  const [newGeneration, setNewGeneration] = useState("");

  // 진행 중 모집이 없으면 404 → 에러가 아닌 "모집 없음(null)"으로 취급
  const { data: recruitment, isLoading: recruitmentLoading } = useQuery({
    queryKey: ["admin", "recruitment", "current"],
    queryFn: async () => {
      try {
        return (await recruitmentApi.getCurrent()).data.data;
      } catch (err) {
        if (err instanceof AxiosError && err.response?.status === 404)
          return null;
        throw err;
      }
    },
    enabled: canManageRecruitment,
  });

  const startMutation = useMutation({
    mutationFn: (generation: number) => recruitmentApi.create(generation),
    onSuccess: () => {
      setNewGeneration("");
      queryClient.invalidateQueries({
        queryKey: ["admin", "recruitment", "current"],
      });
    },
    onError: () =>
      alert("모집 시작 중 오류가 발생했습니다. 다시 시도해주세요."),
  });

  const handleStart = () => {
    const generation = Number(newGeneration);
    if (!Number.isInteger(generation) || generation <= 0) {
      alert("기수를 숫자로 입력해주세요. (예: 12)");
      return;
    }
    if (
      !window.confirm(
        `${generation}기 모집을 시작합니다.\n\n` +
          `지금 등록된 운영진 수가 이번 모집의 투표 인원으로 확정됩니다.\n계속하시겠습니까?`,
      )
    )
      return;
    startMutation.mutate(generation);
  };

  // ── 온보딩 링크 ────────────────────────────────────────────
  // 서버 값 위에 사용자 수정분만 오버레이 — effect 동기화 불필요
  const [edited, setEdited] = useState<Partial<OnboardingLinks>>({});
  const [linkErrors, setLinkErrors] = useState<
    Partial<Record<keyof OnboardingLinks, string>>
  >({});

  const { data: savedLinks, isLoading: linksLoading } = useQuery({
    queryKey: ["admin", "settings", "onboarding-links"],
    queryFn: async () => (await settingsApi.getOnboardingLinks()).data.data,
    enabled: canEditSettings,
  });

  const links: OnboardingLinks = { ...EMPTY_LINKS, ...savedLinks, ...edited };

  const dirty =
    savedLinks != null &&
    LINK_FIELDS.some(({ key }) => links[key].trim() !== savedLinks[key]);

  const saveMutation = useMutation({
    mutationFn: (data: OnboardingLinks) =>
      settingsApi.updateOnboardingLinks(data),
    onSuccess: () => {
      setEdited({});
      queryClient.invalidateQueries({
        queryKey: ["admin", "settings", "onboarding-links"],
      });
      alert("온보딩 링크가 저장되었습니다.");
    },
    onError: () => alert("저장 중 오류가 발생했습니다. 다시 시도해주세요."),
  });

  const handleSave = () => {
    const errors: Partial<Record<keyof OnboardingLinks, string>> = {};
    for (const { key, label } of LINK_FIELDS) {
      if (!isValidUrl(links[key])) {
        errors[key] =
          `${label} 링크를 http:// 또는 https:// 로 시작하는 주소로 입력해주세요.`;
      }
    }
    setLinkErrors(errors);
    if (Object.keys(errors).length > 0) return;

    saveMutation.mutate({
      frontendUrl: links.frontendUrl.trim(),
      openChatUrl: links.openChatUrl.trim(),
      discordUrl: links.discordUrl.trim(),
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-h1 text-gray-900 mb-5">동아리 일정 설정</h1>

      <div className="space-y-6">
        {/* ── 모집 관리 ── */}
        {canManageRecruitment && (
          <section className="rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900">모집 관리</h2>
            <p className="mt-1 text-sm text-gray-500">
              신규 회원 모집 회차를 시작합니다. 마감은{" "}
              <span className="font-medium text-gray-700">
                신청서 조회 탭의 &ldquo;모집 마감 및 합격자 결정&rdquo;
              </span>
              에서 진행돼요.
            </p>

            {recruitmentLoading ? (
              <p className="mt-5 text-sm text-gray-400">불러오는 중...</p>
            ) : recruitment ? (
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg bg-gray-50 px-4 py-3.5 text-sm">
                <span className="inline-flex items-center gap-1.5 font-semibold text-gray-900">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {recruitment.generation}기 모집 진행 중
                </span>
                <span className="text-gray-500">
                  시작일 {formatDate(recruitment.startedAt)}
                </span>
                <span className="text-gray-500">
                  투표 인원 {recruitment.voterCount}명
                </span>
              </div>
            ) : (
              <div className="mt-5">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={newGeneration}
                    onChange={(e) => setNewGeneration(e.target.value)}
                    placeholder="기수 (예: 12)"
                    className="w-32 rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-center outline-none placeholder:text-gray-400 focus:border-gray-400"
                  />
                  <button
                    type="button"
                    onClick={handleStart}
                    disabled={startMutation.isPending || !newGeneration.trim()}
                    className="px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:opacity-90 active:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                  >
                    {startMutation.isPending ? "모집 시작 중..." : "모집 시작"}
                  </button>
                </div>
                <p className="mt-2 text-caption text-gray-400">
                  시작 시점의 운영진 수가 이번 모집의 투표 인원으로 확정돼요.
                  운영진 정리가 끝난 뒤 시작해주세요.
                </p>
              </div>
            )}
          </section>
        )}

        {/* ── 온보딩 링크 ── */}
        {canEditSettings && (
          <section className="rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900">온보딩 링크</h2>
            <p className="mt-1 text-sm text-gray-500">
              합격 안내·회원 승인 메일에 포함되는 링크예요. 새 기수 받기 전에
              최신인지 확인해주세요.
            </p>

            {linksLoading ? (
              <p className="mt-5 text-sm text-gray-400">불러오는 중...</p>
            ) : (
              <div className="mt-5 space-y-4">
                {LINK_FIELDS.map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label
                      htmlFor={`onboarding-${key}`}
                      className="block text-body-sm font-medium text-gray-900"
                    >
                      {label}
                    </label>
                    <input
                      id={`onboarding-${key}`}
                      type="url"
                      value={links[key]}
                      onChange={(e) =>
                        setEdited((prev) => ({
                          ...prev,
                          [key]: e.target.value,
                        }))
                      }
                      placeholder={placeholder}
                      className={`mt-1.5 w-full max-w-xl rounded-lg border px-3 py-2.5 text-sm outline-none placeholder:text-gray-400 focus:border-gray-400 ${
                        linkErrors[key] ? "border-notice" : "border-gray-200"
                      }`}
                    />
                    {linkErrors[key] && (
                      <p className="mt-1 text-caption text-notice">
                        {linkErrors[key]}
                      </p>
                    )}
                  </div>
                ))}

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!dirty || saveMutation.isPending}
                    className="px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:opacity-90 active:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                  >
                    {saveMutation.isPending ? "저장 중..." : "저장"}
                  </button>
                  {!dirty && savedLinks != null && (
                    <span className="text-caption text-gray-400">
                      변경 사항 없음
                    </span>
                  )}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

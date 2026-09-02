"use client";

import { useState } from "react";
import { AxiosError } from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  recruitmentApi,
  settingsApi,
  type OnboardingLinks,
  type FeeInfo,
  type RecruitmentUpdateBody,
} from "@/api";
import { useCan } from "@/hooks/auth";
import { formatDate } from "@/lib/date";

const EMPTY_LINKS: OnboardingLinks = {
  frontendUrl: "",
  openChatUrl: "",
  discordUrl: "",
  kakaoNotiUrl: "",
  kakaoChatUrl: "",
};

const EMPTY_FEE: FeeInfo = {
  bankName: "",
  accountNumber: "",
  accountHolder: "",
  feeAmount: 0,
  discountAmount: 0,
  paymentDeadline: "",
};

/** 모집 일정 3종 — 전부 yyyy-MM-dd (input[type=date] 그대로) */
const SCHEDULE_FIELDS: {
  key: "plannedStartDate" | "plannedEndDate" | "announcementDate";
  label: string;
}[] = [
  { key: "plannedStartDate", label: "모집 시작 예정일" },
  { key: "plannedEndDate", label: "모집 종료 예정일" },
  { key: "announcementDate", label: "합격 발표일" },
];

const FEE_TEXT_FIELDS: {
  key: "bankName" | "accountNumber" | "accountHolder";
  label: string;
  placeholder: string;
}[] = [
  { key: "bankName", label: "은행명", placeholder: "국민은행" },
  {
    key: "accountNumber",
    label: "계좌번호",
    placeholder: "123456-78-901234",
  },
  { key: "accountHolder", label: "예금주", placeholder: "홍길동" },
];

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
    key: "kakaoNotiUrl",
    label: "공지방",
    placeholder: "https://open.kakao.com/o/...",
  },
  {
    key: "kakaoChatUrl",
    label: "수다방",
    placeholder: "https://open.kakao.com/o/...",
  },
  {
    key: "openChatUrl",
    label: "회비 확인 및 문의 방",
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
  const canEditFee = useCan("fee.settings");

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
    onSuccess: (res) => {
      setNewGeneration("");
      queryClient.invalidateQueries({
        queryKey: ["admin", "recruitment", "current"],
      });
      // 투표 인원은 시작 시점에 고정되고 이후 운영진을 추가해도 갱신되지 않는다.
      // 0명으로 굳으면 그 회차 내내 투표 진행률이 "n / 0"으로 보인다.
      if (res.data.data?.voterCount === 0) {
        alert(
          "모집이 시작됐어요.\n\n다만 지금 등록된 운영진이 없어 투표 인원이 0명으로 확정됐습니다.\n운영진을 먼저 지정한 뒤 모집을 다시 시작하는 것을 권장해요.",
        );
      }
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

  // ── 모집 회차 정보 수정 (기수·기간·발표일) ────────────────
  // 서버 값 위에 수정분만 오버레이 — 온보딩 링크와 같은 방식
  const [editedRecruit, setEditedRecruit] = useState<RecruitmentUpdateBody>({});

  const recruitForm = {
    generation: editedRecruit.generation ?? recruitment?.generation ?? 0,
    plannedStartDate:
      editedRecruit.plannedStartDate ?? recruitment?.plannedStartDate ?? "",
    plannedEndDate:
      editedRecruit.plannedEndDate ?? recruitment?.plannedEndDate ?? "",
    announcementDate:
      editedRecruit.announcementDate ?? recruitment?.announcementDate ?? "",
  };

  const recruitDirty =
    recruitment != null &&
    (recruitForm.generation !== recruitment.generation ||
      SCHEDULE_FIELDS.some(
        ({ key }) => recruitForm[key] !== (recruitment[key] ?? ""),
      ));

  const updateRecruitMutation = useMutation({
    mutationFn: (data: RecruitmentUpdateBody) =>
      recruitmentApi.update(recruitment?.recruitmentUuid as string, data),
    onSuccess: () => {
      setEditedRecruit({});
      queryClient.invalidateQueries({
        queryKey: ["admin", "recruitment", "current"],
      });
      alert("모집 회차 정보가 저장되었습니다.");
    },
    onError: () => alert("저장 중 오류가 발생했습니다. 다시 시도해주세요."),
  });

  const handleRecruitSave = () => {
    if (!recruitment) return;
    if (
      !Number.isInteger(recruitForm.generation) ||
      recruitForm.generation <= 0
    ) {
      alert("기수를 숫자로 입력해주세요. (예: 30)");
      return;
    }
    if (
      recruitForm.plannedStartDate &&
      recruitForm.plannedEndDate &&
      recruitForm.plannedStartDate > recruitForm.plannedEndDate
    ) {
      alert("모집 종료일이 시작일보다 빠를 수 없어요.");
      return;
    }
    if (
      recruitForm.plannedEndDate &&
      recruitForm.announcementDate &&
      recruitForm.announcementDate < recruitForm.plannedEndDate
    ) {
      alert("합격 발표일은 모집 종료일 이후여야 해요.");
      return;
    }
    if (
      recruitForm.generation !== recruitment.generation &&
      !window.confirm(
        `기수를 ${recruitment.generation}기 → ${recruitForm.generation}기로 바꿉니다.\n\n` +
          `이 회차의 지원서 질문과 이미 제출된 지원서의 기수도 함께 변경돼요.\n계속하시겠습니까?`,
      )
    )
      return;

    // 빈 날짜는 "변경 없음"으로 보고 아예 보내지 않는다(부분 수정)
    const body: RecruitmentUpdateBody = { generation: recruitForm.generation };
    for (const { key } of SCHEDULE_FIELDS) {
      if (recruitForm[key]) body[key] = recruitForm[key];
    }
    updateRecruitMutation.mutate(body);
  };

  // ── 회비 안내 ──────────────────────────────────────────────
  const [editedFee, setEditedFee] = useState<Partial<FeeInfo>>({});

  // 아직 등록 전이면 404 → 에러가 아닌 "미등록(null)"으로 취급
  const { data: savedFee, isLoading: feeLoading } = useQuery({
    queryKey: ["admin", "settings", "fee-info"],
    queryFn: async () => {
      try {
        return (await settingsApi.getFeeInfo()).data.data;
      } catch (err) {
        if (err instanceof AxiosError && err.response?.status === 404)
          return null;
        throw err;
      }
    },
    enabled: canEditFee,
  });

  const fee: FeeInfo = { ...EMPTY_FEE, ...savedFee, ...editedFee };
  const feeDirty =
    !feeLoading &&
    (savedFee == null
      ? Object.keys(editedFee).length > 0
      : (Object.keys(EMPTY_FEE) as (keyof FeeInfo)[]).some(
          (k) => fee[k] !== savedFee[k],
        ));

  const saveFeeMutation = useMutation({
    mutationFn: (data: FeeInfo) => settingsApi.updateFeeInfo(data),
    onSuccess: () => {
      setEditedFee({});
      queryClient.invalidateQueries({
        queryKey: ["admin", "settings", "fee-info"],
      });
      alert("회비 안내가 저장되었습니다.");
    },
    onError: () => alert("저장 중 오류가 발생했습니다. 다시 시도해주세요."),
  });

  const handleFeeSave = () => {
    for (const { key, label } of FEE_TEXT_FIELDS) {
      if (!fee[key].trim()) {
        alert(`${label}을(를) 입력해주세요.`);
        return;
      }
    }
    if (!fee.paymentDeadline) {
      alert("납부 마감일을 입력해주세요.");
      return;
    }
    if (fee.feeAmount < 0 || fee.discountAmount < 0) {
      alert("금액은 0 이상이어야 해요.");
      return;
    }
    saveFeeMutation.mutate({
      bankName: fee.bankName.trim(),
      accountNumber: fee.accountNumber.trim(),
      accountHolder: fee.accountHolder.trim(),
      feeAmount: fee.feeAmount,
      discountAmount: fee.discountAmount,
      paymentDeadline: fee.paymentDeadline,
    });
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
      // 아직 안 만든 채널은 비워둘 수 있게 한다. 값이 있을 때만 형식을 본다.
      if (links[key].trim() && !isValidUrl(links[key])) {
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
      kakaoNotiUrl: links.kakaoNotiUrl.trim(),
      kakaoChatUrl: links.kakaoChatUrl.trim(),
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
              <>
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

                {/* 기수·일정 수정 — 지원서 안내 문구에 그대로 노출되는 값 */}
                <div className="mt-5 space-y-4">
                  <div>
                    <label
                      htmlFor="recruit-generation"
                      className="block text-body-sm font-medium text-gray-900"
                    >
                      기수
                    </label>
                    <input
                      id="recruit-generation"
                      type="number"
                      min={1}
                      value={recruitForm.generation || ""}
                      onChange={(e) =>
                        setEditedRecruit((prev) => ({
                          ...prev,
                          generation: Number(e.target.value),
                        }))
                      }
                      className="mt-1.5 w-32 rounded-lg border border-gray-200 px-3 py-2.5 text-center text-sm outline-none focus:border-gray-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:max-w-xl">
                    {SCHEDULE_FIELDS.map(({ key, label }) => (
                      <div key={key}>
                        <label
                          htmlFor={`recruit-${key}`}
                          className="block text-body-sm font-medium text-gray-900"
                        >
                          {label}
                        </label>
                        <input
                          id={`recruit-${key}`}
                          type="date"
                          value={recruitForm[key]}
                          onChange={(e) =>
                            setEditedRecruit((prev) => ({
                              ...prev,
                              [key]: e.target.value,
                            }))
                          }
                          className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleRecruitSave}
                      disabled={
                        !recruitDirty || updateRecruitMutation.isPending
                      }
                      className="px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:opacity-90 active:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                    >
                      {updateRecruitMutation.isPending ? "저장 중..." : "저장"}
                    </button>
                    {!recruitDirty && (
                      <span className="text-caption text-gray-400">
                        변경 사항 없음
                      </span>
                    )}
                  </div>
                </div>
              </>
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

        {/* ── 회비 안내 ── */}
        {canEditFee && (
          <section className="rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900">회비 안내</h2>
            <p className="mt-1 text-sm text-gray-500">
              합격자 회비 납부 안내(
              <span className="font-medium text-gray-700">/apply/fee</span>)에
              그대로 노출되는 값이에요.
            </p>

            {feeLoading ? (
              <p className="mt-5 text-sm text-gray-400">불러오는 중...</p>
            ) : (
              <div className="mt-5 space-y-4">
                {savedFee == null && (
                  <p className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-500">
                    아직 등록된 회비 안내가 없어요. 채워서 저장하면 등록됩니다.
                  </p>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:max-w-xl">
                  {FEE_TEXT_FIELDS.map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label
                        htmlFor={`fee-${key}`}
                        className="block text-body-sm font-medium text-gray-900"
                      >
                        {label}
                      </label>
                      <input
                        id={`fee-${key}`}
                        type="text"
                        value={fee[key]}
                        onChange={(e) =>
                          setEditedFee((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                        placeholder={placeholder}
                        className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none placeholder:text-gray-400 focus:border-gray-400"
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:max-w-xl">
                  <div>
                    <label
                      htmlFor="fee-amount"
                      className="block text-body-sm font-medium text-gray-900"
                    >
                      회비 금액(원)
                    </label>
                    <input
                      id="fee-amount"
                      type="number"
                      min={0}
                      value={fee.feeAmount}
                      onChange={(e) =>
                        setEditedFee((prev) => ({
                          ...prev,
                          feeAmount: Number(e.target.value),
                        }))
                      }
                      className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="fee-discount"
                      className="block text-body-sm font-medium text-gray-900"
                    >
                      감면 금액(원)
                    </label>
                    <input
                      id="fee-discount"
                      type="number"
                      min={0}
                      value={fee.discountAmount}
                      onChange={(e) =>
                        setEditedFee((prev) => ({
                          ...prev,
                          discountAmount: Number(e.target.value),
                        }))
                      }
                      className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                    />
                    <p className="mt-1 text-caption text-gray-400">
                      휴학·졸업생 금액
                    </p>
                  </div>
                  <div>
                    <label
                      htmlFor="fee-deadline"
                      className="block text-body-sm font-medium text-gray-900"
                    >
                      납부 마감일
                    </label>
                    <input
                      id="fee-deadline"
                      type="date"
                      value={fee.paymentDeadline}
                      onChange={(e) =>
                        setEditedFee((prev) => ({
                          ...prev,
                          paymentDeadline: e.target.value,
                        }))
                      }
                      className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleFeeSave}
                    disabled={!feeDirty || saveFeeMutation.isPending}
                    className="px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:opacity-90 active:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                  >
                    {saveFeeMutation.isPending ? "저장 중..." : "저장"}
                  </button>
                  {!feeDirty && savedFee != null && (
                    <span className="text-caption text-gray-400">
                      변경 사항 없음
                    </span>
                  )}
                </div>
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

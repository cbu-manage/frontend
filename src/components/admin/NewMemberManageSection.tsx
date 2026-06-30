"use client";

import { useMemo, useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  applicantApi,
  recruitmentApi,
  type ApplicationListItem,
  type FinalDecision,
  type VoteDecision,
} from "@/api";

const DECISION_LABEL: Record<FinalDecision, string> = {
  ACCEPT: "합격",
  REJECT: "불합격",
  HOLD: "보류",
};

const DECISION_OPTIONS: { value: "ACCEPT" | "REJECT"; label: string }[] = [
  { value: "ACCEPT", label: "합격" },
  { value: "REJECT", label: "불합격" },
];

// 서버가 내려준 최종/추천 결정을 화면 기본값으로. 미확정(HOLD)이면 추천값을 따른다.
function baseDecision(item: ApplicationListItem): FinalDecision {
  return item.finalDecision !== "HOLD"
    ? item.finalDecision
    : item.suggestedDecision;
}

export default function NewMemberManageSection() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [overrides, setOverrides] = useState<
    Record<string, "ACCEPT" | "REJECT">
  >({});
  const [openDecisionId, setOpenDecisionId] = useState<string | null>(null);
  const [selectedUuid, setSelectedUuid] = useState<string | null>(null);
  const [voteChoice, setVoteChoice] = useState<VoteDecision | null>(null);
  const [voteReason, setVoteReason] = useState("");
  // 마감 진행 단계 — 버튼에 단계별 문구 표시용
  const [finalizeStage, setFinalizeStage] = useState<
    null | "finalize" | "close"
  >(null);

  // 1) 현재 모집
  const { data: recruitment } = useQuery({
    queryKey: ["admin", "recruitment", "current"],
    queryFn: async () => (await recruitmentApi.getCurrent()).data.data,
  });
  const recruitmentUuid = recruitment?.recruitmentUuid ?? null;

  // 2) 모집의 신청서 목록 (키워드는 서버 필터)
  const {
    data: listData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin", "applications", recruitmentUuid, searchQuery],
    enabled: recruitmentUuid != null,
    queryFn: async () =>
      (
        await applicantApi.getList(recruitmentUuid as string, {
          keyword: searchQuery.trim() || undefined,
          page: 0,
          size: 200,
        })
      ).data.data,
  });

  const applicants: ApplicationListItem[] = useMemo(
    () => listData?.applications.content ?? [],
    [listData],
  );
  const voterCount = listData?.voterCount ?? recruitment?.voterCount ?? 0;

  // 3) 상세 (드릴다운)
  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ["admin", "application", selectedUuid],
    enabled: selectedUuid != null,
    queryFn: async () =>
      (await applicantApi.getDetail(selectedUuid as string)).data.data,
  });

  const effectiveDecision = (item: ApplicationListItem): FinalDecision =>
    overrides[item.applicationUuid] ?? baseDecision(item);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as Element).closest?.("[data-decision-cell]")) {
        setOpenDecisionId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const voteMutation = useMutation({
    mutationFn: (vars: {
      uuid: string;
      decision: VoteDecision;
      reason: string;
    }) => applicantApi.vote(vars.uuid, vars.decision, vars.reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "applications"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "application"] });
    },
    onError: () =>
      alert("투표 저장 중 오류가 발생했습니다. 다시 시도해주세요."),
  });

  const finalizeMutation = useMutation({
    mutationFn: async () => {
      if (!recruitmentUuid) throw new Error("모집 정보가 없습니다.");
      const decisions = applicants.map((a) => ({
        applicationUuid: a.applicationUuid,
        decision: effectiveDecision(a),
      }));
      // 1단계: 최종 결정 일괄 저장
      setFinalizeStage("finalize");
      await applicantApi.finalize(recruitmentUuid, decisions);
      // 2단계: 모집 종료(합격자 메일 발송)
      setFinalizeStage("close");
      await applicantApi.close(recruitmentUuid);
    },
    onSuccess: () => {
      setFinalizeStage(null);
      alert("모집을 마감하고 합격자에게 메일이 발송되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["admin", "applications"] });
    },
    onError: () => {
      setFinalizeStage(null);
      alert("처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    },
  });

  const handleDecisionSelect = (uuid: string, value: "ACCEPT" | "REJECT") => {
    setOverrides((prev) => ({ ...prev, [uuid]: value }));
    setOpenDecisionId(null);
  };

  // 보류(HOLD) 가 하나라도 있으면 마감 불가
  const holdCount = useMemo(
    () => applicants.filter((a) => effectiveDecision(a) === "HOLD").length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [applicants, overrides],
  );

  const handleFinalize = () => {
    const accept = applicants.filter(
      (a) => effectiveDecision(a) === "ACCEPT",
    ).length;
    const reject = applicants.filter(
      (a) => effectiveDecision(a) === "REJECT",
    ).length;

    if (
      !window.confirm(
        `모집을 마감하고 최종 합격자를 결정합니다.\n\n` +
          `  • 합격  ${accept}명\n` +
          `  • 불합격  ${reject}명\n\n` +
          `이 작업은 되돌릴 수 없습니다. 계속하시겠습니까?`,
      )
    )
      return;
    finalizeMutation.mutate();
  };

  const closeDetail = () => {
    setSelectedUuid(null);
    setVoteChoice(null);
    setVoteReason("");
  };

  const handleVoteSave = () => {
    if (!selectedUuid || !voteChoice) return;
    voteMutation.mutate(
      { uuid: selectedUuid, decision: voteChoice, reason: voteReason },
      { onSuccess: closeDetail },
    );
  };

  // ── 상세 화면 ──────────────────────────────────────────────
  if (selectedUuid != null) {
    return (
      <div className="max-w-6xl mx-auto">
        <button
          type="button"
          onClick={closeDetail}
          className="text-sm text-gray-500 transition-colors hover:text-gray-700"
        >
          ← 신청서 목록
        </button>

        {detailLoading || !detail ? (
          <div className="py-20 text-center text-gray-400">
            신청서를 불러오는 중...
          </div>
        ) : (
          <>
            <h1 className="mt-2 text-h1 text-gray-900">
              {detail.application.name} ({detail.application.studentNumber})
            </h1>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
              {/* 좌: 신청서 내용 */}
              <div className="rounded-2xl border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900">신청서 내용</h2>
                <dl className="mt-4 space-y-3 text-sm">
                  {(
                    [
                      ["이름", detail.application.name],
                      ["닉네임", detail.application.nickname],
                      ["학년", detail.application.grade],
                      ["학번", String(detail.application.studentNumber)],
                      ["학과", detail.application.major],
                      ["연락처", detail.application.phoneNumber],
                      ["지원 분야", detail.application.applicationField],
                      ["유입 경로", detail.application.refSource],
                      ["기타 링크", detail.application.refLinkEtc],
                      ["OT 참석", detail.application.canOt ? "참석" : "미참석"],
                      [
                        "환영회 참석",
                        detail.application.canWelcome ? "참석" : "미참석",
                      ],
                    ] as [string, string][]
                  ).map(([k, v]) => (
                    <div key={k} className="flex gap-6">
                      <dt className="w-28 shrink-0 text-gray-500">{k}</dt>
                      <dd className="text-gray-900">{v || "-"}</dd>
                    </div>
                  ))}
                </dl>

                {/* 신청서 문항 답변 */}
                {detail.answers.length > 0 && (
                  <div className="mt-6 space-y-4 border-t border-gray-100 pt-5">
                    {detail.answers.map((a, i) => (
                      <div key={i}>
                        <p className="text-sm font-semibold text-gray-700">
                          {a.question}
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-gray-900">
                          {a.answer || "-"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* 포트폴리오 링크 */}
                {detail.portfolios.length > 0 && (
                  <div className="mt-6 space-y-2 border-t border-gray-100 pt-5">
                    <p className="text-sm font-semibold text-gray-700">
                      포트폴리오
                    </p>
                    {detail.portfolios.map((p, i) => (
                      <a
                        key={i}
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-sm text-brand underline underline-offset-2"
                      >
                        {p.label || p.url}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* 우: 투표 */}
              <div className="space-y-6">
                <div className="rounded-2xl border border-gray-200 p-5">
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-base font-bold text-gray-900">
                      운영진 투표 현황
                    </h2>
                    <span className="text-sm font-semibold text-success">
                      {detail.votes.length} / {voterCount}
                    </span>
                  </div>
                  {detail.votes.length === 0 ? (
                    <p className="mt-3 text-xs text-gray-400">
                      아직 투표한 운영진이 없습니다.
                    </p>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {detail.votes.map((v, i) => (
                        <li
                          key={i}
                          className="flex items-start justify-between gap-3 text-sm"
                        >
                          <span className="text-gray-700">{v.voterName}</span>
                          <span className="shrink-0 text-right">
                            <span
                              className={`font-semibold ${v.decision === "PASS" ? "text-success" : "text-danger"}`}
                            >
                              {v.decision === "PASS" ? "합격" : "불합격"}
                            </span>
                            {v.reason && (
                              <span className="block text-xs text-gray-400">
                                {v.reason}
                              </span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="rounded-2xl border border-gray-200 p-5">
                  <h2 className="text-base font-bold text-gray-900">내 투표</h2>
                  <div className="mt-3 inline-flex rounded-full bg-gray-100 p-1">
                    <button
                      type="button"
                      onClick={() => setVoteChoice("PASS")}
                      className={`rounded-full px-6 py-2 text-sm font-semibold transition-colors ${
                        voteChoice === "PASS"
                          ? "bg-success text-white"
                          : "text-gray-500"
                      }`}
                    >
                      합격
                    </button>
                    <button
                      type="button"
                      onClick={() => setVoteChoice("FAIL")}
                      className={`rounded-full px-6 py-2 text-sm font-semibold transition-colors ${
                        voteChoice === "FAIL"
                          ? "bg-danger text-white"
                          : "text-gray-500"
                      }`}
                    >
                      불합격
                    </button>
                  </div>
                  <textarea
                    value={voteReason}
                    onChange={(e) => setVoteReason(e.target.value)}
                    rows={4}
                    aria-label="투표 사유"
                    placeholder="사유를 입력하세요 (불합격 시 필수)"
                    className="mt-3 w-full resize-none rounded-xl border border-gray-200 p-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={
                      !voteChoice ||
                      (voteChoice === "FAIL" && !voteReason.trim()) ||
                      voteMutation.isPending
                    }
                    onClick={handleVoteSave}
                    className="mt-3 w-full rounded-full bg-gray-900 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                  >
                    {voteMutation.isPending ? "저장 중..." : "투표 저장"}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // ── 목록 화면 ──────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-h1 text-gray-900 mb-5">신청서 조회</h1>

      <div className="mb-6 flex items-center gap-2.5 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        <span className="shrink-0">⚑</span>
        <p>
          운영진 투표 결과를 수렴해 최종 합격자를 결정합니다. 선택 후 일괄 처리
          가능.
        </p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          전체 신청자{" "}
          <span className="font-semibold text-gray-900">
            {applicants.length}명
          </span>
        </p>

        <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5 shrink-0">
          <Search size={13} className="text-gray-400 shrink-0" />
          <input
            className="outline-none text-sm w-36 placeholder:text-gray-400 bg-transparent"
            type="text"
            placeholder="이름·학번으로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading && (
        <div className="py-12 text-center text-gray-500">불러오는 중...</div>
      )}
      {isError && (
        <div className="py-12 text-center text-red-500">
          <p>신청자 목록을 불러오지 못했습니다.</p>
          <p className="mt-2 text-xs text-red-400">
            {(error as Error)?.message}
          </p>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 w-10">
                  #
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500">
                  최종 결정
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">
                  이름
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">
                  학번
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">
                  학과
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500">
                  투표 결과
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500">
                  내 검토 여부
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500">
                  OT 참석
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500">
                  신환회 참석
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">
                  비고
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {applicants.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-400">
                    해당 조건의 신청자가 없습니다.
                  </td>
                </tr>
              ) : (
                applicants.map((item, idx) => {
                  const decision = effectiveDecision(item);
                  return (
                    <tr
                      key={item.applicationUuid}
                      onClick={() => setSelectedUuid(item.applicationUuid)}
                      className="cursor-pointer hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="px-3 py-3 text-center text-xs text-gray-900">
                        {idx + 1}
                      </td>
                      <td
                        className="px-3 py-3 text-center"
                        data-decision-cell
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="relative inline-block">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDecisionId((v) =>
                                v === item.applicationUuid
                                  ? null
                                  : item.applicationUuid,
                              );
                            }}
                            className="text-xs text-gray-900 whitespace-nowrap"
                          >
                            [ {DECISION_LABEL[decision]} ▾ ]
                          </button>
                          {openDecisionId === item.applicationUuid && (
                            <ul className="absolute left-1/2 -translate-x-1/2 z-30 mt-1 w-24 rounded-md border border-gray-200 bg-white shadow-lg">
                              {DECISION_OPTIONS.map((opt) => (
                                <li key={opt.value}>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDecisionSelect(
                                        item.applicationUuid,
                                        opt.value,
                                      );
                                    }}
                                    className="w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 text-center"
                                  >
                                    {opt.label}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-gray-900">{item.name}</td>
                      <td className="px-3 py-3 text-gray-900 tabular-nums">
                        {item.studentNumber}
                      </td>
                      <td className="px-3 py-3 text-gray-900">{item.major}</td>
                      <td className="px-3 py-3 text-center text-gray-900 tabular-nums">
                        {item.passCount} / {voterCount}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`font-semibold ${item.myReviewed ? "text-success" : "text-danger"}`}
                        >
                          {item.myReviewed ? "Y" : "N"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`font-semibold ${item.canOt ? "text-success" : "text-danger"}`}
                        >
                          {item.canOt ? "Y" : "N"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`font-semibold ${item.canWelcome ? "text-success" : "text-danger"}`}
                        >
                          {item.canWelcome ? "Y" : "N"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-gray-900 text-xs">
                        {item.note ?? ""}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleFinalize}
          disabled={
            applicants.length === 0 ||
            holdCount > 0 ||
            finalizeMutation.isPending
          }
          className="px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:opacity-90 active:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          {finalizeStage === "finalize"
            ? "최종 결정 저장 중..."
            : finalizeStage === "close"
              ? "모집 종료 중..."
              : "모집 마감 및 합격자 결정"}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  questionApi,
  type ApplicationQuestion,
  type QuestionCreateBody,
} from "@/api";
import { useCan } from "@/hooks/auth";
import { apiErrorMessage, isConcurrentModification } from "@/lib/errorCode";

const QUESTIONS_QUERY_KEY = ["admin", "application-questions"] as const;

const EMPTY_DRAFT: QuestionCreateBody = {
  type: "",
  question: "",
  description: "",
  isRequired: true,
};

type Props = {
  /** 현재 진행 중인 모집 uuid. 없으면 편집 불가(질문은 회차 종속) */
  recruitmentUuid: string | null;
};

export default function ApplicationQuestionsSection({
  recruitmentUuid,
}: Props) {
  const queryClient = useQueryClient();
  const canEdit = useCan("applications.questions");

  // 편집 중인 질문 — 서버 값 위에 수정분만 오버레이 (effect 동기화 불필요)
  const [edited, setEdited] = useState<
    Record<string, Partial<ApplicationQuestion>>
  >({});
  // 추가 폼은 + 를 눌렀을 때만 열린다
  const [draft, setDraft] = useState<QuestionCreateBody | null>(null);

  // 질문 목록은 공개 GET(현재 기수)만 있어 관리자 화면도 이걸 쓴다
  const {
    data: questions,
    isLoading,
    isError,
  } = useQuery({
    queryKey: QUESTIONS_QUERY_KEY,
    queryFn: async () => (await questionApi.getCurrent()).data.data ?? [],
    enabled: canEdit,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: QUESTIONS_QUERY_KEY });

  const clearEdited = (questionUuid: string) =>
    setEdited((prev) => {
      const next = { ...prev };
      delete next[questionUuid];
      return next;
    });

  const createMutation = useMutation({
    mutationFn: (body: QuestionCreateBody) =>
      questionApi.create(recruitmentUuid as string, body),
    onSuccess: () => {
      setDraft(null);
      invalidate();
    },
    // 409가 두 종류라 상태코드가 아니라 에러 코드로 갈라야 한다
    // (E-APP-0015 질문 키 중복 / E-COMMON-0010 동시 저장 충돌)
    onError: (err) =>
      alert(
        apiErrorMessage(err, "질문 추가 중 오류가 발생했습니다. 다시 시도해주세요."),
      ),
  });

  const updateMutation = useMutation({
    mutationFn: (vars: {
      questionUuid: string;
      body: Partial<ApplicationQuestion>;
    }) =>
      questionApi.update(recruitmentUuid as string, vars.questionUuid, {
        question: vars.body.question,
        description: vars.body.description ?? undefined,
        isRequired: vars.body.isRequired,
        sortOrder: vars.body.sortOrder,
        version: vars.body.version,
      }),
    onSuccess: (_res, vars) => {
      clearEdited(vars.questionUuid);
      invalidate();
    },
    onError: (err, vars) => {
      // 충돌이면 내 입력을 남겨두면 안 된다. 그대로 두면 다시 눌러도 계속 409만 난다.
      if (isConcurrentModification(err)) {
        clearEdited(vars.questionUuid);
        invalidate();
      }
      alert(apiErrorMessage(err, "질문 수정 중 오류가 발생했습니다."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (questionUuid: string) =>
      questionApi.remove(recruitmentUuid as string, questionUuid),
    onSuccess: invalidate,
    onError: (err) => alert(apiErrorMessage(err, "질문 삭제 중 오류가 발생했습니다.")),
  });

  if (!canEdit) return null;

  const merged = (q: ApplicationQuestion): ApplicationQuestion => ({
    ...q,
    ...edited[q.questionUuid],
  });
  const isDirty = (q: ApplicationQuestion) => {
    const e = edited[q.questionUuid];
    if (!e) return false;
    const m = merged(q);
    return (
      m.question !== q.question ||
      (m.description ?? "") !== (q.description ?? "") ||
      m.isRequired !== q.isRequired ||
      m.sortOrder !== q.sortOrder
    );
  };

  const handleSave = (q: ApplicationQuestion) => {
    const m = merged(q);
    if (!m.question.trim()) {
      alert("질문 본문을 입력해주세요.");
      return;
    }
    // 같은 순서가 둘이면 지원자 화면의 문항 차례가 매번 달라질 수 있다
    const orderTaken = (questions ?? []).some(
      (other) =>
        other.questionUuid !== q.questionUuid &&
        merged(other).sortOrder === m.sortOrder,
    );
    if (orderTaken) {
      alert(`노출 순서 ${m.sortOrder}번은 다른 질문이 쓰고 있어요.`);
      return;
    }
    updateMutation.mutate({
      questionUuid: q.questionUuid,
      body: {
        question: m.question.trim(),
        description: m.description?.trim() ?? "",
        isRequired: m.isRequired,
        sortOrder: m.sortOrder,
        // 편집을 시작할 때 화면이 들고 있던 값. 그 사이 남이 저장했으면 서버가 409로 막는다
        version: q.version,
      },
    });
  };

  const handleDelete = (q: ApplicationQuestion) => {
    if (
      !window.confirm(
        `"${q.question}" 질문을 삭제합니다.\n\n이미 제출된 지원서의 답변은 이 질문 키(${q.type})로 매칭돼요. 계속하시겠습니까?`,
      )
    )
      return;
    deleteMutation.mutate(q.questionUuid);
  };

  const handleCreate = () => {
    if (!draft) return;
    if (!draft.type.trim() || !draft.question.trim()) {
      alert("질문 키(type)와 질문 본문은 필수예요.");
      return;
    }
    createMutation.mutate({
      type: draft.type.trim().toUpperCase(),
      question: draft.question.trim(),
      description: draft.description?.trim() || undefined,
      isRequired: draft.isRequired,
    });
  };

  return (
    <section className="mt-8 rounded-2xl border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900">지원서 질문</h2>
      <p className="mt-1 text-sm text-gray-500">
        지원자가 <span className="font-medium text-gray-700">/apply</span> 에서
        작성하는 서술형 문항이에요. 질문 키(type)는 제출된 답변과 매칭되는
        값이라 만든 뒤에는 바꿀 수 없어요.
      </p>

      {recruitmentUuid == null && (
        <p className="mt-5 rounded-lg bg-gray-50 px-4 py-3.5 text-sm text-gray-500">
          진행 중인 모집이 없어 질문을 편집할 수 없어요. 모집을 먼저
          시작해주세요.
        </p>
      )}

      {isLoading ? (
        <p className="mt-5 text-sm text-gray-400">불러오는 중...</p>
      ) : isError ? (
        <p className="mt-5 text-sm text-notice">
          질문 목록을 불러오지 못했습니다.
        </p>
      ) : (
        <div className="mt-5 space-y-3">
          {(questions ?? []).length === 0 && (
            <p className="text-sm text-gray-400">
              등록된 질문이 없어요. 아래 + 로 추가해주세요.
            </p>
          )}

          {(questions ?? []).map((q) => {
            const m = merged(q);
            const dirty = isDirty(q);
            return (
              <div
                key={q.questionUuid}
                className="rounded-xl border border-gray-200 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-md bg-gray-100 px-2 py-1 text-caption font-semibold text-gray-600">
                    {q.type}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(q)}
                    disabled={recruitmentUuid == null}
                    aria-label={`${q.question} 삭제`}
                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-notice disabled:opacity-40"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <input
                  type="text"
                  value={m.question}
                  onChange={(e) =>
                    setEdited((prev) => ({
                      ...prev,
                      [q.questionUuid]: {
                        ...prev[q.questionUuid],
                        question: e.target.value,
                      },
                    }))
                  }
                  aria-label="질문 본문"
                  placeholder="질문 본문"
                  className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none placeholder:text-gray-400 focus:border-gray-400"
                />
                <input
                  type="text"
                  value={m.description ?? ""}
                  onChange={(e) =>
                    setEdited((prev) => ({
                      ...prev,
                      [q.questionUuid]: {
                        ...prev[q.questionUuid],
                        description: e.target.value,
                      },
                    }))
                  }
                  aria-label="질문 부가 설명"
                  placeholder="부가 설명 (선택) — 예: 500자 이내로 작성해주세요"
                  className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none placeholder:text-gray-400 focus:border-gray-400"
                />

                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={m.isRequired}
                      onChange={(e) =>
                        setEdited((prev) => ({
                          ...prev,
                          [q.questionUuid]: {
                            ...prev[q.questionUuid],
                            isRequired: e.target.checked,
                          },
                        }))
                      }
                      className="h-4 w-4 rounded border-gray-300 accent-gray-900"
                    />
                    필수 답변
                  </label>

                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    노출 순서
                    <input
                      type="number"
                      min={1}
                      value={m.sortOrder}
                      onChange={(e) =>
                        setEdited((prev) => ({
                          ...prev,
                          [q.questionUuid]: {
                            ...prev[q.questionUuid],
                            sortOrder: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-16 rounded-lg border border-gray-200 px-2 py-1.5 text-center text-sm outline-none focus:border-gray-400"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => handleSave(q)}
                    disabled={
                      !dirty ||
                      recruitmentUuid == null ||
                      updateMutation.isPending
                    }
                    className="ml-auto rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {updateMutation.isPending ? "저장 중..." : "저장"}
                  </button>
                </div>
              </div>
            );
          })}

          {/* 새 질문 추가 */}
          {draft ? (
            <div className="rounded-xl border border-gray-300 border-dashed p-4">
              <input
                type="text"
                value={draft.type}
                onChange={(e) =>
                  setDraft((prev) =>
                    prev ? { ...prev, type: e.target.value } : prev,
                  )
                }
                aria-label="질문 키"
                placeholder="질문 키 (영문 대문자, 예: MOTIVATE)"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none placeholder:text-gray-400 focus:border-gray-400"
              />
              <input
                type="text"
                value={draft.question}
                onChange={(e) =>
                  setDraft((prev) =>
                    prev ? { ...prev, question: e.target.value } : prev,
                  )
                }
                aria-label="질문 본문"
                placeholder="질문 본문"
                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none placeholder:text-gray-400 focus:border-gray-400"
              />
              <input
                type="text"
                value={draft.description ?? ""}
                onChange={(e) =>
                  setDraft((prev) =>
                    prev ? { ...prev, description: e.target.value } : prev,
                  )
                }
                aria-label="질문 부가 설명"
                placeholder="부가 설명 (선택)"
                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none placeholder:text-gray-400 focus:border-gray-400"
              />

              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={draft.isRequired ?? true}
                    onChange={(e) =>
                      setDraft((prev) =>
                        prev ? { ...prev, isRequired: e.target.checked } : prev,
                      )
                    }
                    className="h-4 w-4 rounded border-gray-300 accent-gray-900"
                  />
                  필수 답변
                </label>

                <div className="ml-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDraft(null)}
                    className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={
                      recruitmentUuid == null || createMutation.isPending
                    }
                    className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {createMutation.isPending ? "저장 중..." : "저장"}
                  </button>
                </div>
              </div>
              <p className="mt-2 text-caption text-gray-400">
                노출 순서는 비워두면 마지막 순번으로 자동 배정돼요.
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setDraft({ ...EMPTY_DRAFT })}
              disabled={recruitmentUuid == null}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-300 py-3 text-sm font-medium text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus size={16} />
              질문 추가
            </button>
          )}
        </div>
      )}
    </section>
  );
}

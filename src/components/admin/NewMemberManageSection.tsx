"use client";

import { useMemo, useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { applicantApi, type ApplicantItem } from "@/api/applicant.api";

type LocalStatus = "PASS" | "HOLD" | "FAIL";

const STATUS_OPTIONS: { value: "PASS" | "FAIL"; label: string }[] = [
  { value: "PASS", label: "합격" },
  { value: "FAIL", label: "불합격" },
];

const STATUS_LABEL: Record<LocalStatus, string> = {
  PASS: "합격", HOLD: "보류", FAIL: "불합격",
};


// 전원 합격 표가 아니면 운영진 재논의 필요 (기권 포함)
function toLocalStatus(item: ApplicantItem): LocalStatus {
  if (item.passCount < item.totalVoters) return "HOLD";
  return "PASS";
}

const DUMMY_APPLICANTS: ApplicantItem[] = [
  { id: 1, name: "박지훈", studentNumber: 2024152012, major: "컴퓨터공학과", passCount: 5, failCount: 0, totalVoters: 5, status: "PASS", appliedAt: "2025-03-01T10:00:00", myReviewed: true, otAttended: true, welcomeAttended: true, note: "24기에 지원" },
  { id: 2, name: "김지원", studentNumber: 2024240011, major: "인공지능학과", passCount: 4, failCount: 1, totalVoters: 5, status: "PENDING", appliedAt: "2025-03-01T11:00:00", myReviewed: false, otAttended: false, welcomeAttended: false, note: "23, 24기에 지원" },
  { id: 3, name: "한소명", studentNumber: 2024152015, major: "컴퓨터공학과", passCount: 5, failCount: 0, totalVoters: 5, status: "PENDING", appliedAt: "2025-03-01T12:00:00", myReviewed: false, otAttended: true, welcomeAttended: false },
  { id: 4, name: "윤가은", studentNumber: 2024240022, major: "인공지능학과", passCount: 4, failCount: 1, totalVoters: 5, status: "PENDING", appliedAt: "2025-03-02T09:00:00", myReviewed: false, otAttended: false, welcomeAttended: false },
  { id: 5, name: "강민지", studentNumber: 2024152011, major: "컴퓨터공학과", passCount: 3, failCount: 2, totalVoters: 5, status: "PENDING", appliedAt: "2025-03-02T10:00:00", myReviewed: true, otAttended: true, welcomeAttended: true },
  { id: 6, name: "정도윤", studentNumber: 2024180023, major: "게임공학과", passCount: 3, failCount: 2, totalVoters: 5, status: "PENDING", appliedAt: "2025-03-02T11:00:00", myReviewed: true, otAttended: true, welcomeAttended: true },
  { id: 7, name: "이서연", studentNumber: 2024132013, major: "메카트로닉스공학과", passCount: 2, failCount: 3, totalVoters: 5, status: "PENDING", appliedAt: "2025-03-02T12:00:00", myReviewed: true, otAttended: true, welcomeAttended: true },
  { id: 8, name: "송재현", studentNumber: 2024152016, major: "컴퓨터공학과", passCount: 2, failCount: 3, totalVoters: 5, status: "PENDING", appliedAt: "2025-03-03T09:00:00", myReviewed: true, otAttended: true, welcomeAttended: true },
  { id: 9, name: "최예나", studentNumber: 2024152014, major: "컴퓨터공학과", passCount: 1, failCount: 4, totalVoters: 5, status: "PENDING", appliedAt: "2025-03-03T10:00:00", myReviewed: true, otAttended: true, welcomeAttended: true },
  { id: 10, name: "임준혁", studentNumber: 2024152017, major: "컴퓨터공학과", passCount: 0, failCount: 5, totalVoters: 5, status: "FAIL", appliedAt: "2025-03-03T11:00:00", myReviewed: true, otAttended: true, welcomeAttended: true },
];

export default function NewMemberManageSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [localStatuses, setLocalStatuses] = useState<Record<number, LocalStatus>>({});
  const [openStatusId, setOpenStatusId] = useState<number | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "applicants"],
    queryFn: () => applicantApi.getAll(),
    enabled: false,
  });

  const applicants: ApplicantItem[] = useMemo(
    () => data?.data.data ?? DUMMY_APPLICANTS,
    [data],
  );

  const getStatus = (id: number, item: ApplicantItem): LocalStatus =>
    localStatuses[id] ?? toLocalStatus(item);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as Element).closest?.("[data-status-cell]")) {
        setOpenStatusId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const notifyMutation = useMutation({
    mutationFn: () => applicantApi.notifyPass(),
    onSuccess: () => {
      alert("합격자에게 메일이 발송되었습니다.");
    },
    onError: () => {
      alert("메일 발송 중 오류가 발생했습니다. 다시 시도해주세요.");
    },
  });

  const saveStatusMutation = useMutation({
    mutationFn: () =>
      Promise.all(
        applicants.map((a) =>
          applicantApi.updateStatus(a.id, getStatus(a.id, a) as "PASS" | "FAIL")
        )
      ),
    onSuccess: () => {
      notifyMutation.mutate();
    },
    onError: () => {
      alert("상태 저장 중 오류가 발생했습니다. 다시 시도해주세요.");
    },
  });

  const handleStatusSelect = (id: number, value: "PASS" | "FAIL") => {
    setLocalStatuses((prev) => ({ ...prev, [id]: value }));
    setOpenStatusId(null);
  };

  // 보류 수 — 하나라도 있으면 마감 불가
  const holdCount = useMemo(
    () => applicants.filter((a) => (localStatuses[a.id] ?? toLocalStatus(a)) === "HOLD").length,
    [applicants, localStatuses],
  );

  const filteredApplicants = useMemo(() => {
    if (!searchQuery.trim()) return applicants;
    const q = searchQuery.trim().toLowerCase();
    return applicants.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        String(a.studentNumber).includes(q),
    );
  }, [applicants, searchQuery]);

  const handleFinalize = () => {
    const { passCount, failCount } = applicants.reduce(
      (acc, a) => {
        const s = getStatus(a.id, a);
        if (s === "PASS") acc.passCount++;
        else if (s === "FAIL") acc.failCount++;
        return acc;
      },
      { passCount: 0, failCount: 0 },
    );

    if (
      !window.confirm(
        `모집을 마감하고 최종 합격자를 결정합니다.\n\n` +
        `  • 합격  ${passCount}명\n` +
        `  • 불합격  ${failCount}명\n\n` +
        `이 작업은 되돌릴 수 없습니다. 계속하시겠습니까?`,
      )
    ) return;

    saveStatusMutation.mutate();
  };

  return (
    <div className="max-w-6xl mx-auto">

      {/* 제목 */}
      <h1 className="text-h1 text-gray-900 mb-5">신청서 조회</h1>

      {/* 안내 배너 */}
      <div className="mb-6 flex items-center gap-2.5 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        <span className="shrink-0">⚑</span>
        <p>
          운영진 투표 결과를 수렴해 최종 합격자를 결정합니다. 선택 후 일괄 처리 가능.
        </p>
      </div>

      {/* 총원 + 검색 */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          전체 신청자{" "}
          <span className="font-semibold text-gray-900">{applicants.length}명</span>
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

      {/* 로딩 / 에러 */}
      {isLoading && (
        <div className="py-12 text-center text-gray-500">불러오는 중...</div>
      )}
      {isError && (
        <div className="py-12 text-center text-red-500">
          <p>신청자 목록을 불러오지 못했습니다.</p>
          <p className="mt-2 text-xs text-red-400">{(error as Error)?.message}</p>
        </div>
      )}

      {/* 테이블 */}
      {!isLoading && !isError && (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 w-10">#</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500">최종 결정</th>
                <th className="px-3 py-3 text-left   text-xs font-medium text-gray-500">이름</th>
                <th className="px-3 py-3 text-left   text-xs font-medium text-gray-500">학번</th>
                <th className="px-3 py-3 text-left   text-xs font-medium text-gray-500">학과</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500">투표 결과</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500">내 검토 여부</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500">OT 참석</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500">신환회 참석</th>
                <th className="px-3 py-3 text-left   text-xs font-medium text-gray-500">비고</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredApplicants.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-400">
                    해당 조건의 신청자가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredApplicants.map((item, idx) => {
                  const localStatus = getStatus(item.id, item);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-3 py-3 text-center text-xs text-gray-900">{idx + 1}</td>
                      <td className="px-3 py-3 text-center" data-status-cell>
                        <div className="relative inline-block">
                          <button
                            type="button"
                            onClick={() => setOpenStatusId((v) => v === item.id ? null : item.id)}
                            className="text-xs text-gray-900 whitespace-nowrap"
                          >
                            [ {STATUS_LABEL[localStatus]} ▾ ]
                          </button>
                          {openStatusId === item.id && (
                            <ul className="absolute left-1/2 -translate-x-1/2 z-30 mt-1 w-24 rounded-md border border-gray-200 bg-white shadow-lg">
                              {STATUS_OPTIONS.map((opt) => (
                                <li key={opt.value}>
                                  <button
                                    type="button"
                                    onClick={() => handleStatusSelect(item.id, opt.value)}
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
                      <td className="px-3 py-3 text-gray-900 tabular-nums">{item.studentNumber}</td>
                      <td className="px-3 py-3 text-gray-900">{item.major}</td>
                      <td className="px-3 py-3 text-center text-gray-900 tabular-nums">
                        {item.passCount} / {item.totalVoters}
                      </td>
                      <td className="px-3 py-3 text-center text-gray-900">{item.myReviewed ? "Y" : "N"}</td>
                      <td className="px-3 py-3 text-center text-gray-900">{item.otAttended ? "Y" : "N"}</td>
                      <td className="px-3 py-3 text-center text-gray-900">{item.welcomeAttended ? "Y" : "N"}</td>
                      <td className="px-3 py-3 text-gray-900 text-xs">{item.note ?? ""}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 하단 액션 */}
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleFinalize}
          disabled={holdCount > 0 || saveStatusMutation.isPending || notifyMutation.isPending}
          className="px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:opacity-90 active:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          {saveStatusMutation.isPending ? "상태 저장 중..." : notifyMutation.isPending ? "메일 발송 중..." : "모집 마감 및 합격자 결정"}
        </button>
      </div>

    </div>
  );
}

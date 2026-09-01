"use client";

import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Modal from "@/components/common/Modal";
import SearchBar from "@/components/common/SearchBar";
import Pagination from "@/components/shared/Pagination";
import { useCan } from "@/hooks/auth";
import { memberApi, type MemberInfo, type MemberUpdateDTO } from "@/api";

/**
 * 운영진 지정 — 역할별 카드(추가/해제).
 *
 * 운영진 추가/해제 = `PATCH /member` (MemberUpdateDTO.role 변경).
 * 허용 역할(서버): 개발자관리자·회장·부회장·인원관리. 회장/부회장 카드는 ADMIN만 노출.
 * 회원 검색 전용 API가 없어 전체 회원을 받아 클라에서 필터한다.
 */

const PAGE_SIZE = 50;
// 모달 목록 페이지당 인원 / 페이지 번호 최대 노출 개수
const MODAL_PAGE_SIZE = 10;
const MODAL_PAGE_WINDOW = 5;

type RoleDef = { label: string; role: string };

// 회장·부회장 = ADMIN(owner)만 지정 (staff.assignLeader)
const LEADER_DEFS: RoleDef[] = [
  { label: "회장", role: "ROLE_PRESIDENT" },
  { label: "부회장", role: "ROLE_VICE_PRESIDENT" },
];
// 운영진 서브롤 = ADMIN·회장·부회장·인원관리 지정 (staff.assign)
const STAFF_DEFS: RoleDef[] = [
  { label: "총무", role: "ROLE_TREASURER" },
  { label: "인원 관리", role: "ROLE_MEMBER_MANAGER" },
  { label: "행사 관리", role: "ROLE_EVENT_MANAGER" },
  { label: "홍보", role: "ROLE_PROMOTION_MANAGER" },
  { label: "서기", role: "ROLE_SECRETARY" },
  { label: "일반 운영진", role: "ROLE_MANAGER" },
];

/** 다른 정보가 지워지지 않게 기존 필드를 유지하고 role 만 바꿔 전송 */
function toUpdateDTO(m: MemberInfo, role: string): MemberUpdateDTO {
  return {
    userId: m.id,
    role,
    name: m.name,
    phoneNumber: m.phoneNumber,
    major: m.major,
    grade: m.grade,
    studentNumber: m.studentNumber,
    generation: m.generation,
    note: m.note,
  };
}

export default function StaffAssignSection() {
  const queryClient = useQueryClient();
  // 지정/해제 권한(서버가 최종 판정). 메뉴 게이팅 외 컴포넌트 내부에서도 방어.
  const canAssign = useCan("staff.assign");
  // 회장·부회장 칸은 ADMIN(owner)에게만 노출
  const canAssignLeader = useCan("staff.assignLeader");
  // 회장·부회장 카드는 누구에게나 보여준다. 회장 본인이 자기 자리를 확인할 수 없으면
  // 화면이 "운영진 명단"으로서 성립하지 않는다. 지정·해제 버튼만 ADMIN에게 준다.
  const roleDefs = useMemo(() => [...LEADER_DEFS, ...STAFF_DEFS], []);
  const isLeaderRole = (role: string) =>
    LEADER_DEFS.some((def) => def.role === role);

  const [addTarget, setAddTarget] = useState<RoleDef | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [modalPage, setModalPage] = useState(1);

  // 전체 회원 (검색 전용 API 없음 → 전부 받아 클라 필터)
  const {
    data: members = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin", "members", "staff"],
    queryFn: async () => {
      // 서버 응답이 배열(ApiResponseListMemberDTO)·페이징 둘 다 존재해 방어적으로 파싱 (MemberManageSection과 동일)
      const parseResponse = (raw: unknown): MemberInfo[] => {
        if (Array.isArray(raw)) return raw as MemberInfo[];
        const obj = raw as Record<string, unknown>;
        const inner = obj?.data;
        if (Array.isArray(inner)) return inner as MemberInfo[];
        const paged = inner as { content?: MemberInfo[] } | undefined;
        if (paged?.content) return paged.content;
        // data 없이 최상위에 content가 오는 페이징 응답도 있다
        const topLevel = obj as { content?: MemberInfo[] } | undefined;
        return topLevel?.content ?? [];
      };

      // 서버가 size 파라미터를 무시하고 고정 크기(10명)로 반환 → length<size 종료 판정 불가.
      // 빈 페이지가 나올 때까지 순회하되, page 무시(같은 목록 반복) 시 무한루프 방지로 id 중복이면 종료.
      const all: MemberInfo[] = [];
      const seen = new Set<number>();
      let page = 0;
      while (true) {
        const res = await memberApi.getAll(page, PAGE_SIZE);
        const content = parseResponse(res.data as unknown);
        const fresh = content.filter((m) => !seen.has(m.id));
        if (fresh.length === 0) break;
        fresh.forEach((m) => seen.add(m.id));
        all.push(...fresh);
        page += 1;
      }
      return all;
    },
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { member: MemberInfo; role: string }) =>
      memberApi.update(toUpdateDTO(vars.member, vars.role)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "members"] });
    },
    onError: () => alert("처리 중 오류가 발생했습니다. 다시 시도해주세요."),
  });

  // 역할별 현재 운영진
  const membersByRole = useMemo(() => {
    const map: Record<string, MemberInfo[]> = {};
    for (const def of [...LEADER_DEFS, ...STAFF_DEFS]) {
      map[def.role] = members.filter((m) => m.role === def.role);
    }
    return map;
  }, [members]);

  // 추가 후보 = 아직 일반 회원(ROLE_USER) + 이름·학번 검색
  const candidates = useMemo(() => {
    const q = query.trim();
    return members
      .filter((m) => m.role === "ROLE_USER")
      .filter((m) =>
        q ? m.name.includes(q) || String(m.studentNumber).includes(q) : true,
      );
  }, [members, query]);

  // 검색은 전체 후보 대상, 목록 표시는 페이지 단위로 잘라서
  const totalModalPages = Math.max(
    1,
    Math.ceil(candidates.length / MODAL_PAGE_SIZE),
  );
  const safePage = Math.min(modalPage, totalModalPages);
  const windowStart = Math.max(
    1,
    Math.min(safePage - 2, totalModalPages - MODAL_PAGE_WINDOW + 1),
  );
  const modalPageNumbers = Array.from(
    { length: Math.min(MODAL_PAGE_WINDOW, totalModalPages) },
    (_, i) => windowStart + i,
  );
  const visibleCandidates = candidates.slice(
    (safePage - 1) * MODAL_PAGE_SIZE,
    safePage * MODAL_PAGE_SIZE,
  );

  const closeModal = () => {
    setAddTarget(null);
    setQuery("");
    setSelected([]);
    setModalPage(1);
  };

  const handleAdd = async () => {
    if (!addTarget || selected.length === 0) return;
    const picked = members.filter((m) => selected.includes(m.id));
    await Promise.all(
      picked.map((m) =>
        updateMutation.mutateAsync({ member: m, role: addTarget.role }),
      ),
    );
    closeModal();
  };

  const handleRemove = (m: MemberInfo) => {
    updateMutation.mutate({ member: m, role: "ROLE_USER" });
  };

  if (!canAssign) {
    return (
      <section className="max-w-6xl mx-auto py-20 text-center text-gray-400">
        운영진 지정 권한이 없습니다.
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="max-w-6xl mx-auto py-20 text-center text-gray-400">
        운영진 목록을 불러오는 중...
      </section>
    );
  }

  if (isError) {
    return (
      <section className="max-w-6xl mx-auto py-20 text-center text-red-500">
        회원 목록을 불러오지 못했습니다.
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-h1 text-gray-900">운영진 지정</h1>
        <p className="mt-2 text-base text-gray-600">
          역할별로 운영진을 추가하거나 해제할 수 있어요.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2">
        {roleDefs.map((def) => {
          const roleMembers = membersByRole[def.role] ?? [];
          const canEditRole = isLeaderRole(def.role) ? canAssignLeader : true;
          return (
            <div
              key={def.role}
              className="overflow-hidden rounded-xl border border-gray-200"
            >
              <div className="flex items-center justify-between bg-brand px-4 py-2.5">
                <span className="text-sm font-bold text-white">
                  {def.label}
                </span>
                {canEditRole && (
                  <button
                    type="button"
                    aria-label={`${def.label} 운영진 추가`}
                    onClick={() => setAddTarget(def)}
                    className="flex size-6 items-center justify-center rounded-full bg-white/30 text-white transition-colors hover:bg-white/40"
                  >
                    <Plus size={14} />
                  </button>
                )}
              </div>
              <ul className="divide-y divide-gray-100 px-4 py-1">
                {roleMembers.length === 0 ? (
                  <li className="py-6 text-center text-sm text-gray-400">
                    지정된 운영진이 없어요
                  </li>
                ) : (
                  roleMembers.map((m) => (
                    <li
                      key={m.id}
                      className="flex items-center justify-between py-2.5"
                    >
                      <span className="text-sm text-gray-900">
                        {m.generation}기 {m.name}
                      </span>
                      {canEditRole && (
                        <button
                          type="button"
                          aria-label={`${m.name} 해제`}
                          onClick={() => handleRemove(m)}
                          disabled={updateMutation.isPending}
                          className="text-gray-400 transition-colors hover:text-danger disabled:opacity-40"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </li>
                  ))
                )}
              </ul>
            </div>
          );
        })}
      </div>

      <Modal
        open={addTarget !== null}
        onClose={closeModal}
        title="이름 또는 학번을 검색하여 추가해주세요."
        className="w-full max-w-2xl"
        footer={
          <button
            type="button"
            disabled={selected.length === 0 || updateMutation.isPending}
            onClick={handleAdd}
            className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {addTarget ? `${addTarget.label}에 추가` : "추가"} (
            {selected.length})
          </button>
        }
      >
        <SearchBar
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setModalPage(1);
          }}
          placeholder="이름 또는 학번을 검색해 주세요."
          className="w-full"
        />
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-100">
          <div className="flex items-center gap-4 bg-[#eef7e9] px-4 py-2.5 text-sm font-semibold text-gray-700">
            <span className="w-8" />
            <span className="flex-1 text-center">학과</span>
            <span className="w-24 text-center">학번</span>
            <span className="w-16 text-center">기수</span>
            <span className="w-20 text-center">이름</span>
          </div>
          {candidates.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              검색 결과가 없어요
            </p>
          ) : (
            visibleCandidates.map((c) => {
              const checked = selected.includes(c.id);
              return (
                <label
                  key={c.id}
                  className="flex cursor-pointer items-center gap-4 border-t border-gray-100 px-4 py-3 text-sm text-gray-900 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      setSelected((prev) =>
                        checked
                          ? prev.filter((id) => id !== c.id)
                          : [...prev, c.id],
                      )
                    }
                    className="peer sr-only"
                  />
                  {/* 커스텀 체크박스 — PrivacyAgreement와 동일 패턴 (흰 체크 SVG) */}
                  <span className="flex w-8 justify-center">
                    <span
                      className={`flex size-4 items-center justify-center rounded border-2 transition-colors duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-brand peer-focus-visible:ring-offset-1 ${
                        checked
                          ? "border-brand bg-brand"
                          : "border-gray-300 bg-transparent"
                      }`}
                    >
                      {checked && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 12 12"
                          fill="none"
                          className="size-3"
                        >
                          <path
                            d="M2 6l3 3 5-5"
                            stroke="#fff"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                  </span>
                  <span className="flex-1 text-center">{c.major}</span>
                  <span className="w-24 text-center">{c.studentNumber}</span>
                  <span className="w-16 text-center">{c.generation}기</span>
                  <span className="w-20 text-center">{c.name}</span>
                </label>
              );
            })
          )}
        </div>
        {totalModalPages > 1 && (
          <Pagination
            currentPage={safePage}
            totalPages={modalPageNumbers}
            onPageChange={setModalPage}
            className="mt-4"
          />
        )}
      </Modal>
    </section>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Modal from "@/components/common/Modal";
import SearchBar from "@/components/common/SearchBar";
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
  const roleDefs = useMemo(
    () => (canAssignLeader ? [...LEADER_DEFS, ...STAFF_DEFS] : STAFF_DEFS),
    [canAssignLeader],
  );

  const [addTarget, setAddTarget] = useState<RoleDef | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<number[]>([]);

  // 전체 회원 (검색 전용 API 없음 → 전부 받아 클라 필터)
  const {
    data: members = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin", "members", "staff"],
    queryFn: async () => {
      // 서버가 size 파라미터를 무시할 수 있어 length 기반 종료는 잘림 위험 → last 플래그로 종료
      const all: MemberInfo[] = [];
      let page = 0;
      while (true) {
        const res = await memberApi.getAll(page, PAGE_SIZE);
        const data = res.data?.data;
        const content = data?.content ?? [];
        all.push(...content);
        if (!data || data.last || content.length === 0) break;
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

  // 추가 후보 = 아직 일반 회원(ROLE_USER) + 이름 검색
  const candidates = useMemo(() => {
    const q = query.trim();
    return members
      .filter((m) => m.role === "ROLE_USER")
      .filter((m) => (q ? m.name.includes(q) : true));
  }, [members, query]);

  const closeModal = () => {
    setAddTarget(null);
    setQuery("");
    setSelected([]);
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roleDefs.map((def) => {
          const roleMembers = membersByRole[def.role] ?? [];
          return (
            <div
              key={def.role}
              className="overflow-hidden rounded-xl border border-gray-200"
            >
              <div className="flex items-center justify-between bg-brand px-4 py-2.5">
                <span className="text-sm font-bold text-white">
                  {def.label}
                </span>
                <button
                  type="button"
                  aria-label={`${def.label} 운영진 추가`}
                  onClick={() => setAddTarget(def)}
                  className="flex size-6 items-center justify-center rounded-full bg-white/30 text-white transition-colors hover:bg-white/40"
                >
                  <Plus size={14} />
                </button>
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
                      <button
                        type="button"
                        aria-label={`${m.name} 해제`}
                        onClick={() => handleRemove(m)}
                        disabled={updateMutation.isPending}
                        className="text-gray-400 transition-colors hover:text-danger disabled:opacity-40"
                      >
                        <X size={18} />
                      </button>
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
        title="이름을 검색하여 추가해주세요."
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
          onChange={(e) => setQuery(e.target.value)}
          placeholder="이름을 검색해 주세요."
          className="w-full"
        />
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-100">
          <div className="flex items-center gap-4 bg-[#eef7e9] px-4 py-2.5 text-sm font-semibold text-gray-700">
            <span className="w-8" />
            <span className="flex-1">학과</span>
            <span className="w-16 text-center">기수</span>
            <span className="w-20 text-center">이름</span>
          </div>
          {candidates.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              검색 결과가 없어요
            </p>
          ) : (
            candidates.map((c) => {
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
                    className="size-5 w-8 accent-brand"
                  />
                  <span className="flex-1">{c.major}</span>
                  <span className="w-16 text-center">{c.generation}기</span>
                  <span className="w-20 text-center">{c.name}</span>
                </label>
              );
            })
          )}
        </div>
      </Modal>
    </section>
  );
}

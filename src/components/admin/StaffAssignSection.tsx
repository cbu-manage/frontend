"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import Modal from "@/components/common/Modal";
import SearchBar from "@/components/common/SearchBar";

/**
 * 운영진 지정 — 역할별 카드(추가/해제). ADMIN·회장·부회장 전용(useCan("staff.assign")).
 * Figma: [Design] 06. owner 계정이 관리자 지정할 페이지.
 *
 * TODO(API): 역할별 운영진 목록 조회 / 회원 검색 / 역할 부여·해제 연동.
 *            현재는 목데이터 + 로컬 상태.
 */

type Member = { id: number; gen: string; name: string };
type Candidate = { id: number; dept: string; grade: number; name: string };

// 카드 = 운영진 서브롤 (일반 운영진 = ROLE_MANAGER)
const ROLE_CARDS = [
  "총무",
  "인원 관리",
  "행사 관리",
  "홍보",
  "서기",
  "일반 운영진",
] as const;
type RoleLabel = (typeof ROLE_CARDS)[number];

// TODO: API 연동 후 교체 (목데이터)
const INITIAL: Record<RoleLabel, Member[]> = {
  총무: [{ id: 1, gen: "14기", name: "홍길동" }],
  "인원 관리": [{ id: 2, gen: "14기", name: "홍길동" }],
  "행사 관리": [{ id: 3, gen: "15기", name: "홍길동" }],
  홍보: [{ id: 4, gen: "15기", name: "홍길동" }],
  서기: [{ id: 5, gen: "14기", name: "홍길동" }],
  "일반 운영진": [{ id: 6, gen: "15기", name: "홍길동" }],
};

const CANDIDATES: Candidate[] = [
  { id: 101, dept: "컴퓨터공학과", grade: 3, name: "김민주" },
  { id: 102, dept: "컴퓨터공학과", grade: 3, name: "이서연" },
  { id: 103, dept: "컴퓨터공학과", grade: 2, name: "박도윤" },
];

export default function StaffAssignSection() {
  const [members, setMembers] = useState<Record<RoleLabel, Member[]>>(INITIAL);
  const [addTarget, setAddTarget] = useState<RoleLabel | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<number[]>([]);

  const closeModal = () => {
    setAddTarget(null);
    setQuery("");
    setSelected([]);
  };

  const handleAdd = () => {
    if (!addTarget) return;
    // TODO(API): 선택 멤버에게 addTarget 역할 부여
    const added: Member[] = CANDIDATES.filter((c) =>
      selected.includes(c.id),
    ).map((c) => ({ id: c.id, gen: `${c.grade}학년`, name: c.name }));
    setMembers((prev) => ({
      ...prev,
      [addTarget]: [...prev[addTarget], ...added],
    }));
    closeModal();
  };

  const handleRemove = (role: RoleLabel, id: number) => {
    // TODO(API): 해당 멤버의 역할 해제
    setMembers((prev) => ({
      ...prev,
      [role]: prev[role].filter((m) => m.id !== id),
    }));
  };

  const filtered = CANDIDATES.filter((c) => c.name.includes(query.trim()));

  return (
    <section className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-h1 text-gray-900">운영진 지정</h1>
        <p className="mt-2 text-base text-gray-600">
          역할별로 운영진을 추가하거나 해제할 수 있어요.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {ROLE_CARDS.map((role) => (
          <div
            key={role}
            className="overflow-hidden rounded-2xl border border-gray-200"
          >
            <div className="flex items-center justify-between bg-brand px-6 py-4">
              <span className="text-base font-bold text-white">{role}</span>
              <button
                type="button"
                aria-label={`${role} 운영진 추가`}
                onClick={() => setAddTarget(role)}
                className="flex size-7 items-center justify-center rounded-full bg-white/30 text-white transition-colors hover:bg-white/40"
              >
                <Plus size={16} />
              </button>
            </div>
            <ul className="min-h-[220px] divide-y divide-gray-100 px-6 py-3">
              {members[role].length === 0 ? (
                <li className="py-12 text-center text-sm text-gray-400">
                  지정된 운영진이 없어요
                </li>
              ) : (
                members[role].map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between py-4"
                  >
                    <span className="text-sm text-gray-900">
                      {m.gen} {m.name}
                    </span>
                    <button
                      type="button"
                      aria-label={`${m.name} 해제`}
                      onClick={() => handleRemove(role, m.id)}
                      className="text-gray-400 transition-colors hover:text-danger"
                    >
                      <X size={18} />
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        ))}
      </div>

      <Modal
        open={addTarget !== null}
        onClose={closeModal}
        title={`이름을 검색하여 추가해주세요.`}
        className="w-full max-w-2xl"
        footer={
          <button
            type="button"
            disabled={selected.length === 0}
            onClick={handleAdd}
            className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {addTarget ? `${addTarget}에 추가` : "추가"} ({selected.length})
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
            <span className="w-16 text-center">학년</span>
            <span className="w-20 text-center">이름</span>
          </div>
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              검색 결과가 없어요
            </p>
          ) : (
            filtered.map((c) => {
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
                  <span className="flex-1">{c.dept}</span>
                  <span className="w-16 text-center">{c.grade}</span>
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

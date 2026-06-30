"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { memberApi, type MemberInfo } from "@/api/member.api";
import PGN from "@/components/shared/Pagination";

const PAGE_SIZE = 10;

export default function MemberManageSection() {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [generationFilter, setGenerationFilter] = useState<number | null>(null);
  const [searchName, setSearchName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const { data: allMembers = [], isLoading } = useQuery({
    queryKey: ["admin", "members"],
    queryFn: async () => {
      const parseResponse = (raw: unknown): MemberInfo[] => {
        if (Array.isArray(raw)) return raw as MemberInfo[];
        const obj = raw as Record<string, unknown>;
        const inner = obj?.data;
        if (Array.isArray(inner)) return inner as MemberInfo[];
        const paged = inner as { content?: MemberInfo[] } | undefined;
        return paged?.content ?? [];
      };

      const all: MemberInfo[] = [];
      let page = 0;

      while (true) {
        const res = await memberApi.getAll(page, PAGE_SIZE);
        const content = parseResponse(res.data as unknown);
        if (content.length === 0) break;
        all.push(...content);
        if (content.length < PAGE_SIZE) break;
        page += 1;
      }
      return all;
    },
  });

  const generationList = useMemo(() => {
    return [...new Set(allMembers.map((m) => m.generation))].sort(
      (a, b) => a - b,
    );
  }, [allMembers]);

  const filteredData = useMemo(() => {
    let result = allMembers;
    if (generationFilter !== null) {
      result = result.filter((m) => m.generation === generationFilter);
    }
    if (searchName.trim()) {
      const keyword = searchName.trim().toLowerCase();
      result = result.filter((m) => m.name.toLowerCase().includes(keyword));
    }
    return result;
  }, [allMembers, generationFilter, searchName]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));

  const members = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredData.slice(start, start + PAGE_SIZE);
  }, [filteredData, currentPage]);

  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, i) => i + 1),
    [totalPages],
  );

  const isEntireSelected =
    selectedItems.length === members.length && members.length > 0;

  const entireSelectToggle = () => {
    if (isEntireSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(members.map((i) => i.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedItems([]);
  };

  const filterByGeneration = (gen: number) => {
    setGenerationFilter(gen);
    setCurrentPage(1);
    setSelectedItems([]);
    setDropdownVisible(false);
  };

  const resetFilter = () => {
    setGenerationFilter(null);
    setCurrentPage(1);
    setSelectedItems([]);
    setDropdownVisible(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-20 text-center text-gray-400">
        회원 목록을 불러오는 중...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-h1 text-gray-900 mb-6">회원 관리</h1>

      <div className="flex items-center justify-between gap-4 mb-6">
        <p className="text-lg">
          전체 동아리 회원{" "}
          <span className="font-semibold">{filteredData.length}명</span>
        </p>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setDropdownVisible((v) => !v)}
              className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
            >
              {generationFilter !== null ? `${generationFilter}기` : "기수"}
            </button>
            {dropdownVisible && (
              <ul className="absolute right-0 z-10 mt-1 w-32 rounded-md border bg-white shadow-lg max-h-60 overflow-y-auto">
                <li
                  className="px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm"
                  onClick={resetFilter}
                >
                  전체
                </li>
                {generationList.map((g) => (
                  <li
                    key={g}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm"
                    onClick={() => filterByGeneration(g)}
                  >
                    {g}기
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2">
            <Search size={14} className="shrink-0 text-gray-400" />
            <input
              className="outline-none text-sm"
              type="text"
              placeholder="이름을 검색하세요."
              value={searchName}
              onChange={(e) => {
                setSearchName(e.target.value);
                setCurrentPage(1);
                setSelectedItems([]);
              }}
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">
                <button
                  className={`h-5 w-5 rounded border ${isEntireSelected ? "bg-gray-900" : "bg-white"}`}
                  onClick={entireSelectToggle}
                  aria-label="select all"
                />
              </th>
              <th className="p-3 text-center font-medium text-gray-700">
                기수
              </th>
              <th className="p-3 text-left font-medium text-gray-700">이름</th>
              <th className="p-3 text-center font-medium text-gray-700">
                운영진 여부
              </th>
              <th className="p-3 text-center font-medium text-gray-700">
                학번
              </th>
              <th className="p-3 text-center font-medium text-gray-700">
                학과
              </th>
              <th className="p-3 text-left font-medium text-gray-700">
                메일 주소
              </th>
              <th className="p-3 text-center font-medium text-gray-700">
                회비 납부
              </th>
              <th className="p-3 text-center font-medium text-gray-700">
                활동 여부
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-6 text-center text-gray-400">
                  {generationFilter !== null || searchName.trim()
                    ? "검색 결과가 없습니다."
                    : "등록된 회원이 없습니다."}
                </td>
              </tr>
            ) : (
              members.map((item) => (
                <tr
                  key={item.id}
                  className={`transition-colors ${selectedItems.includes(item.id) ? "bg-gray-50" : "hover:bg-gray-50/50"}`}
                >
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                    />
                  </td>
                  <td className="p-3 text-center">{item.generation}기</td>
                  <td className="p-3 font-medium">{item.name}</td>
                  <td className="p-3 text-center">
                    {(Array.isArray(item.role)
                      ? item.role
                      : item.role
                        ? [item.role as string]
                        : []
                    ).some((r) => r && r !== "ROLE_USER") ? (
                      <span className="font-medium text-brand">운영진</span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="p-3 text-center">{item.studentNumber}</td>
                  <td className="p-3 text-center">{item.major}</td>
                  <td className="p-3">{item.email || "-"}</td>
                  <td className="p-3 text-center font-medium text-emerald-600">
                    납부
                  </td>
                  <td className="p-3 text-center">활동</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedItems.length > 0 && (
        <div className="mt-4 flex items-center gap-3">
          <span className="text-sm text-gray-600">
            {selectedItems.length}명 선택
          </span>
          <button
            onClick={() => {
              alert(
                `선택된 ${selectedItems.length}명의 회비 상태를 일괄 변경합니다.\n(API 연동 예정)`,
              );
            }}
            className="rounded-md bg-gray-900 text-white px-4 py-2 text-sm hover:opacity-90 transition-opacity"
          >
            회비 일괄 납부 처리
          </button>
        </div>
      )}

      <PGN
        currentPage={currentPage}
        totalPages={pageNumbers}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

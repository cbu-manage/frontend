"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  CodingTestRow,
  SolveStatus,
} from "@/components/coding-test/CodingTestRow";
import PGN from "@/components/shared/Pagination";
import { Pencil } from "lucide-react";
import RequireMember from "@/components/auth/RequireMember";
import { codingTestApi } from "@/api";
import { useCodingTestMetaStore } from "@/store/codingTestMetaStore";
import { useCodingTestMeta } from "@/hooks/coding-test/useCodingTestMeta";

// ============================================
// FilterButton / SelectedFilterChip
// ============================================

interface FilterButtonProps {
  label: string;
  isOpen: boolean;
  onClick: () => void;
}

function FilterButton({ label, isOpen, onClick }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2 bg-[#EEEFF3]/80 hover:bg-[#EEEFF3] rounded-xl text-base font-semibold text-gray-900 transition-colors"
    >
      {label}
      <svg
        className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
        fill="none"
        stroke="#959AA3"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
  );
}

interface SelectedFilterChipProps {
  label: string;
  onClear: () => void;
}

function SelectedFilterChip({ label, onClear }: SelectedFilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClear}
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#DBFAC8] hover:bg-[#c5f2ae] transition-colors"
    >
      <span className="text-sm font-medium text-[#50A219]">{label}</span>
      <span
        className="flex items-center justify-center w-3 h-3 rounded-full text-[#50A219] text-[15px] leading-none"
        aria-hidden="true"
      >
        ✕
      </span>
    </button>
  );
}

// ============================================
// 응답 정규화
// ============================================

function extractProblemList(raw: unknown): {
  content: unknown[];
  totalPages: number;
} {
  const obj =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const data = obj.data ?? obj;
  const content = Array.isArray(data)
    ? data
    : data && typeof data === "object" && "content" in data
      ? ((data as { content?: unknown[] }).content ?? [])
      : [];
  const totalPages =
    data &&
    typeof data === "object" &&
    "totalPages" in data &&
    typeof (data as { totalPages?: number }).totalPages === "number"
      ? (data as { totalPages: number }).totalPages
      : 1;
  return { content: content as unknown[], totalPages };
}

// ============================================
// CodingTestPage
// ============================================

const PAGE_SIZE = 10;

export default function CodingTestPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("전체");
  const [languageFilterIds, setLanguageFilterIds] = useState<number[]>([]);
  const [platformFilterIds, setPlatformFilterIds] = useState<number[]>([]);
  const [categoryFilterIds, setCategoryFilterIds] = useState<number[]>([]);
  const [openFilter, setOpenFilter] = useState<string | null>(null);

  const filterContainerRef = useRef<HTMLDivElement | null>(null);

  useCodingTestMeta();
  const platforms = useCodingTestMetaStore((s) => s.platforms);
  const languages = useCodingTestMetaStore((s) => s.languages);
  const categories = useCodingTestMetaStore((s) => s.categories);

  const pageIndex = Math.max(0, currentPage - 1);

  const {
    data: listRes,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "codingTest",
      "list",
      pageIndex,
      platformFilterIds,
      categoryFilterIds,
    ],
    queryFn: () =>
      codingTestApi.getList({
        page: pageIndex,
        size: PAGE_SIZE,
        sort: ["post.createdAt,DESC"],
        platformId:
          platformFilterIds.length > 0 ? platformFilterIds : undefined,
        categoryId:
          categoryFilterIds.length > 0 ? categoryFilterIds : undefined,
      }),
  });

  const { content: rawList, totalPages } = useMemo(() => {
    const body = listRes?.data;
    return extractProblemList(body ?? null);
  }, [listRes?.data]);

  const problems = useMemo(() => {
    const list = rawList as import("@/api").ProblemListItem[];
    return list.map((item) => ({
      id: item.problemId ?? item.postId ?? item.id ?? 0,
      status: (item.problemStatus === "SOLVED"
        ? "해결"
        : "미해결") as SolveStatus,
      title: item.title ?? "",
      languageId:
        item.languageId ??
        languages.find(
          (l) =>
            l.name &&
            item.languageName &&
            l.name.toLowerCase() === item.languageName.toLowerCase(),
        )?.id,
      platformId: item.platformId,
      language:
        item.languageName ??
        languages.find((l) => l.id === item.languageId)?.name ??
        "기타",
      categories: item.categories ?? [],
      platform:
        item.platformName ??
        platforms.find((p) => p.id === item.platformId)?.name ??
        "기타",
      author:
        item.authorName != null
          ? item.authorGeneration != null
            ? `${item.authorGeneration}기 ${item.authorName}`
            : item.authorName
          : undefined,
    }));
  }, [rawList, languages, platforms]);

  const filteredProblems = useMemo(() => {
    const selectedCategoryNames =
      categoryFilterIds.length === 0
        ? []
        : categories
            .filter((c) => categoryFilterIds.includes(c.id))
            .map((c) => c.name)
            .filter((name): name is string => !!name);

    return problems.filter((p) => {
      const statusOk = statusFilter === "전체" || p.status === statusFilter;
      const langOk =
        languageFilterIds.length === 0 ||
        (p.languageId != null && languageFilterIds.includes(p.languageId));
      const categoryOk =
        selectedCategoryNames.length === 0 ||
        (Array.isArray(p.categories) &&
          p.categories.some((name) => selectedCategoryNames.includes(name)));
      return statusOk && langOk && categoryOk;
    });
  }, [
    problems,
    statusFilter,
    languageFilterIds,
    categoryFilterIds,
    categories,
  ]);

  const pageNumbers = Array.from(
    { length: Math.max(1, totalPages) },
    (_, i) => i + 1,
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!openFilter) return;
      if (
        filterContainerRef.current &&
        !filterContainerRef.current.contains(event.target as Node)
      ) {
        setOpenFilter(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openFilter]);

  const toggleFilter = (filter: string) => {
    setOpenFilter(openFilter === filter ? null : filter);
  };

  const toggleIdFilter = (
    id: number,
    list: number[],
    setList: (next: number[]) => void,
  ) => {
    if (list.includes(id)) setList(list.filter((x) => x !== id));
    else setList([...list, id]);
  };

  return (
    <RequireMember>
      <div className="w-full bg-gray-0 min-h-screen">
        <main className="px-[15%] pt-16 pb-16">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              코딩테스트 준비
            </h1>
          </div>

          <div className="flex flex-col gap-3 mb-4 sm:mb-6">
            <div
              className="flex flex-wrap items-center justify-between gap-3"
              ref={filterContainerRef}
            >
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {/* 상태 */}
                <div className="relative">
                  <FilterButton
                    label="상태"
                    isOpen={openFilter === "status"}
                    onClick={() => toggleFilter("status")}
                  />
                  {openFilter === "status" && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[100px] sm:min-w-[120px]">
                      {["전체", "미해결", "해결"].map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setStatusFilter(option);
                            setOpenFilter(null);
                          }}
                          className="w-full px-3 sm:px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 언어 */}
                <div className="relative">
                  <FilterButton
                    label="언어"
                    isOpen={openFilter === "language"}
                    onClick={() => toggleFilter("language")}
                  />
                  {openFilter === "language" && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px] sm:min-w-[140px]">
                      {languages.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            toggleIdFilter(
                              opt.id,
                              languageFilterIds,
                              setLanguageFilterIds,
                            )
                          }
                          className={`w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm first:rounded-t-lg last:rounded-b-lg ${
                            languageFilterIds.includes(opt.id)
                              ? "bg-brand/20 text-gray-900 font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {opt.name ?? `ID ${opt.id}`}
                        </button>
                      ))}
                      {languages.length === 0 && (
                        <div className="px-3 py-2 text-gray-400 text-sm">
                          불러오는 중...
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 플랫폼 */}
                <div className="relative">
                  <FilterButton
                    label="플랫폼"
                    isOpen={openFilter === "platform"}
                    onClick={() => toggleFilter("platform")}
                  />
                  {openFilter === "platform" && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px] sm:min-w-[140px]">
                      {platforms.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            toggleIdFilter(
                              opt.id,
                              platformFilterIds,
                              setPlatformFilterIds,
                            )
                          }
                          className={`w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm first:rounded-t-lg last:rounded-b-lg ${
                            platformFilterIds.includes(opt.id)
                              ? "bg-brand/20 text-gray-900 font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {opt.name ?? `ID ${opt.id}`}
                        </button>
                      ))}
                      {platforms.length === 0 && (
                        <div className="px-3 py-2 text-gray-400 text-sm">
                          불러오는 중...
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 카테고리 */}
                <div className="relative">
                  <FilterButton
                    label="카테고리"
                    isOpen={openFilter === "category"}
                    onClick={() => toggleFilter("category")}
                  />
                  {openFilter === "category" && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px] sm:min-w-[140px]">
                      {categories.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            toggleIdFilter(
                              opt.id,
                              categoryFilterIds,
                              setCategoryFilterIds,
                            )
                          }
                          className={`w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm first:rounded-t-lg last:rounded-b-lg ${
                            categoryFilterIds.includes(opt.id)
                              ? "bg-brand/20 text-gray-900 font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {opt.name ?? `ID ${opt.id}`}
                        </button>
                      ))}
                      {categories.length === 0 && (
                        <div className="px-3 py-2 text-gray-400 text-sm">
                          불러오는 중...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <Link href="/coding-test/write">
                <button className="px-6 py-3 bg-gray-800 text-white rounded-2xl font-medium text-base hover:bg-[#3E434A]/90 transition-colors flex items-center gap-4 shrink-0 whitespace-nowrap tracking-wide">
                  <Pencil size={18} />글 작성하기
                </button>
              </Link>
            </div>
          </div>

          {/* 선택된 필터 칩 */}
          {(statusFilter !== "전체" ||
            languageFilterIds.length > 0 ||
            platformFilterIds.length > 0 ||
            categoryFilterIds.length > 0) && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {statusFilter !== "전체" && (
                <SelectedFilterChip
                  label={statusFilter}
                  onClear={() => setStatusFilter("전체")}
                />
              )}
              {languageFilterIds.map((id) => {
                const opt = languages.find((l) => l.id === id);
                return (
                  <SelectedFilterChip
                    key={`lang-${id}`}
                    label={opt?.name ?? `ID ${id}`}
                    onClear={() =>
                      setLanguageFilterIds(
                        languageFilterIds.filter((x) => x !== id),
                      )
                    }
                  />
                );
              })}
              {platformFilterIds.map((id) => {
                const opt = platforms.find((p) => p.id === id);
                return (
                  <SelectedFilterChip
                    key={`plat-${id}`}
                    label={opt?.name ?? `ID ${id}`}
                    onClear={() =>
                      setPlatformFilterIds(
                        platformFilterIds.filter((x) => x !== id),
                      )
                    }
                  />
                );
              })}
              {categoryFilterIds.map((id) => {
                const opt = categories.find((c) => c.id === id);
                return (
                  <SelectedFilterChip
                    key={`cat-${id}`}
                    label={opt?.name ?? `ID ${id}`}
                    onClear={() =>
                      setCategoryFilterIds(
                        categoryFilterIds.filter((x) => x !== id),
                      )
                    }
                  />
                );
              })}
              <button
                onClick={() => {
                  setStatusFilter("전체");
                  setLanguageFilterIds([]);
                  setPlatformFilterIds([]);
                  setCategoryFilterIds([]);
                }}
                className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                초기화
              </button>
            </div>
          )}

          <div className="bg-white border border-gray-200 overflow-x-auto">
            <table className="w-full min-w-150">
              <thead className="bg-brand text-white">
                <tr>
                  <th className="py-2 sm:py-3 px-3 text-center text-base font-medium w-20 sm:w-25">
                    상태
                  </th>
                  <th className="py-2 sm:py-3 px-3 text-center text-base font-medium w-60 sm:w-80">
                    문제
                  </th>
                  <th className="py-2 sm:py-3 px-3 text-center text-base font-medium w-32">
                    언어
                  </th>
                  <th className="py-2 sm:py-3 px-3 text-center text-base font-medium w-32">
                    플랫폼
                  </th>
                  <th className="py-2 sm:py-3 px-3 text-center text-base font-medium w-32">
                    작성자
                  </th>
                  <th className="py-2 sm:py-3 px-3 text-center text-base font-medium w-15 sm:w-20"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500">
                      목록을 불러오는 중...
                    </td>
                  </tr>
                )}
                {isError && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-red-500">
                      목록을 불러오지 못했습니다.
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  !isError &&
                  filteredProblems.map((problem) => (
                    <CodingTestRow
                      key={problem.id}
                      id={problem.id}
                      status={problem.status}
                      title={problem.title}
                      language={problem.language}
                      platform={problem.platform}
                      author={problem.author}
                    />
                  ))}
                {!isLoading &&
                  !isError &&
                  filteredProblems.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-gray-500"
                      >
                        해당 조건에 맞는 문제가 없습니다.
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>

          <PGN
            currentPage={currentPage}
            totalPages={pageNumbers}
            onPageChange={(num) => setCurrentPage(num)}
          />
        </main>
      </div>
    </RequireMember>
  );
}

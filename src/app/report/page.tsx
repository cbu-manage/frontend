"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Sparkles, Search } from "lucide-react";
import { useRouter } from "next/navigation";

import RequireMember from "@/components/auth/RequireMember";
import ReportCard from "@/components/report/ReportCard";
import Pagination from "@/components/shared/Pagination";
import {
  groupApi,
  reportApi,
  type MyGroupItem,
  type ReportPreviewItem,
} from "@/api";

const PAGE_SIZE = 9;

function extractMyGroups(raw: unknown): MyGroupItem[] {
  if (!raw || typeof raw !== "object") return [];
  const obj = raw as Record<string, unknown>;
  const data = obj.data ?? obj;
  if (Array.isArray(data)) return data as MyGroupItem[];
  if (data && typeof data === "object" && "content" in data) {
    const arr = (data as { content?: unknown }).content;
    return Array.isArray(arr) ? (arr as MyGroupItem[]) : [];
  }
  return [];
}

export default function ReportPage() {
  const router = useRouter();
  const [activeGroup, setActiveGroup] = useState("전체");
  const [search, setSearch] = useState("");
  const [submittedKeyword, setSubmittedKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageIndex = currentPage - 1;
  const resetPage = () => setCurrentPage(1);

  // 검색 실행 (Enter 또는 아이콘 클릭) — 입력값 확정 + 1페이지로
  const runSearch = () => {
    setSubmittedKeyword(search.trim());
    setCurrentPage(1);
  };

  const {
    data: groupRes,
    isLoading: groupsLoading,
    isError: groupsError,
  } = useQuery({
    queryKey: ["myGroups"],
    queryFn: () => groupApi.getMyGroups(),
  });

  const allGroups = extractMyGroups(groupRes?.data ?? null);
  const groupTabs = ["전체", ...allGroups.map((g: MyGroupItem) => g.groupName)];

  // 선택한 탭이 특정 그룹이면 그 그룹 ID — "전체"면 null
  const selectedGroupId =
    activeGroup === "전체"
      ? null
      : (allGroups.find((g) => g.groupName === activeGroup)?.groupId ?? null);

  const keyword = submittedKeyword || undefined;

  // 그룹 필터·검색 모두 서버에서: "전체"→getList, 특정 그룹→getGroupList (서버 페이징/검색)
  const {
    data: reportRes,
    isLoading: reportsLoading,
    isError: reportsError,
  } = useQuery({
    queryKey: ["reports", activeGroup, pageIndex, keyword],
    queryFn: () =>
      selectedGroupId == null
        ? reportApi.getList({ page: pageIndex, size: PAGE_SIZE, keyword })
        : reportApi.getGroupList(selectedGroupId, { page: pageIndex, size: PAGE_SIZE, keyword }),
  });

  const isError = groupsError || reportsError;

  const reportPage = reportRes?.data?.data?.reports;
  const reports: ReportPreviewItem[] = reportPage?.content ?? [];
  const totalPagesCount = Math.max(1, reportPage?.page?.totalPages ?? 1);
  const totalPages = Array.from({ length: totalPagesCount }, (_, i) => i + 1);

  return (
    <RequireMember>
      <main className="min-h-screen pb-16 bg-white">
        <div className="container-x-lg">
          <div className="pt-6 lg:pt-16 pb-6">
            <h1 className="text-h1 text-gray-900 mb-2">내 보고서</h1>
            <p className="text-base text-gray-600">본인이 속한 스터디·멤버가 작성한 보고서만 조회됩니다.</p>
          </div>

          {groupsLoading && (
            <div className="text-center py-16 text-gray-500">불러오는 중...</div>
          )}
          {isError && (
            <div className="text-center py-16 text-red-500">목록을 불러오지 못했습니다.</div>
          )}

          {/* 그룹 없음 — 빈 상태 */}
          {!groupsLoading && !isError && allGroups.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 py-20 px-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8F5E3]">
                <Sparkles className="h-8 w-8 text-[#5a9b4a]" strokeWidth={2} />
              </div>
              <p className="text-lg font-semibold text-gray-700 mb-2">아직 가입한 스터디/프로젝트가 없어요</p>
              <p className="text-gray-500 max-w-sm mx-auto">
                스터디·프로젝트에 참여하고 보고서를 올려보세요!
                <br />
                <Link href="/study" className="mt-3 inline-block text-[#5a9b4a] font-medium hover:underline">스터디 둘러보기 →</Link>
                {" · "}
                <Link href="/project" className="text-[#5a9b4a] font-medium hover:underline">프로젝트 둘러보기 →</Link>
              </p>
            </div>
          )}

          {/* 그룹 있음 — 보고서 뷰 */}
          {!groupsLoading && !isError && allGroups.length > 0 && (
            <>
              {/* 업로드 버튼 */}
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => router.push("/report/write")}
                  className="px-5 py-2.5 bg-gray-900 text-white rounded-lg font-medium text-sm hover:bg-gray-700 transition-colors shrink-0"
                >
                  + 새 보고서 업로드
                </button>
              </div>

              {/* 필터: 그룹 탭 + 검색 */}
              <div className="rounded-xl border border-gray-200 bg-white p-4 mb-6 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-medium text-gray-700 shrink-0 whitespace-nowrap">내 스터디/프로젝트</span>
                  {groupTabs.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => { setActiveGroup(g); resetPage(); }}
                      className={
                        activeGroup === g
                          ? "px-3 py-1 rounded-full text-sm font-medium bg-brand text-white transition-colors"
                          : "px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
                      }
                    >
                      {g}
                    </button>
                  ))}
                </div>
                {/* 검색 (서버 keyword — 제목·작성자) · Enter 또는 아이콘 클릭으로 검색 */}
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5">
                  <button
                    type="button"
                    onClick={runSearch}
                    aria-label="검색"
                    className="shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
                  >
                    <Search size={14} />
                  </button>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") runSearch(); }}
                    placeholder="제목, 작성자로 검색"
                    aria-label="제목·작성자 검색"
                    className="flex-1 text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* 카드 그리드 — 검색/페이지 전환 시 필터바는 유지하고 이 영역만 로딩 */}
              {reportsLoading ? (
                <div className="py-16 text-center text-gray-500">불러오는 중...</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                    {reports.map((item) => (
                      <ReportCard
                        key={item.postId}
                        id={item.postId}
                        tag={item.groupName}
                        title={item.title}
                        author={item.authorName}
                        generation={item.generation}
                        date={item.date}
                      />
                    ))}
                    {reports.length === 0 && (
                      <div className="col-span-full py-16 text-center text-sm text-gray-400">보고서가 없습니다.</div>
                    )}
                  </div>

                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </>
              )}
            </>
          )}
        </div>
      </main>
    </RequireMember>
  );
}

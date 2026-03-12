"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import {
  StudyCard as SDC,
  StudyStatus,
  StudyCategory,
} from "@/components/study/StudyCard";
import Sidebar from "@/components/shared/Sidebar";
import PGN from "@/components/shared/Pagination";
import { useStudyList } from "@/hooks/study/useStudyList";
import RequireMember from "@/components/auth/RequireMember";
import { useUserStore } from "@/store/userStore";

const CATEGORIES = [
  { label: "전체", value: "전체" },
  { label: "C++", value: "C++" },
  { label: "Python", value: "Python" },
  { label: "Java", value: "Java" },
  { label: "알고리즘", value: "알고리즘" },
  { label: "기타", value: "기타" },
];

export default function StudyPage() {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [statusFilter, setStatusFilter] = useState<StudyStatus>("모집 중");
  const [currentPage, setCurrentPage] = useState(1);

  const name = useUserStore((s) => s.name);
  const isMember = !!name;

  const { data, isLoading, isError } = useStudyList({
    page: currentPage,
    status: statusFilter,
    category: selectedCategory,
    enabled: isMember,
  });

  const studies = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const handleChangeStatus = (status: StudyStatus) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const formatDateOnly = (iso?: string) => {
    if (!iso) return "방금 전";
    try {
      const d = new Date(iso);
      return d
        .toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\. /g, ". ");
    } catch {
      return iso;
    }
  };

  return (
    <RequireMember>
      <main className="min-h-screen min-w-[1200px] bg-[#F8FAFF]">
        <div className="flex min-w-[1200px]">
          <Sidebar
            items={CATEGORIES}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
            writeLink="/study/write"
          />

          <div className="flex-1 ml-[calc(9.375vw+240px)] pl-6 pr-[9.375%] py-16">
            <div>
              {/* 페이지 헤더 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    스터디 모집
                  </h1>
                </div>
              </div>

              {/* 상태 필터 탭 */}
              <div className="flex items-center gap-3 mb-6 text-sm">
                <button
                  onClick={() => handleChangeStatus("모집 중")}
                  className={`flex items-center gap-1 transition-colors ${
                    statusFilter === "모집 중"
                      ? "text-gray-900 font-medium"
                      : "text-gray-400"
                  }`}
                >
                  {statusFilter === "모집 중" && <Check className="w-4 h-4" />}
                  모집 중
                </button>

                <span className="text-gray-300">|</span>

                <button
                  onClick={() => {
                    handleChangeStatus("모집 완료");
                  }}
                  className={`flex items-center gap-1 transition-colors ${
                    statusFilter === "모집 완료"
                      ? "text-gray-900 font-medium"
                      : "text-gray-400"
                  }`}
                >
                  {statusFilter === "모집 완료" && (
                    <Check className="w-4 h-4" />
                  )}
                  모집 완료
                </button>
              </div>

              {/* 카드 그리드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {isLoading && (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    스터디 목록을 불러오는 중입니다...
                  </div>
                )}

                {isError && (
                  <div className="col-span-full text-center py-12 text-red-500">
                    스터디 목록을 불러오는 중 오류가 발생했습니다.
                  </div>
                )}

                {!isLoading &&
                  !isError &&
                  studies.map((study) => {
                    const s = study as {
                      id: number;
                      title?: string;
                      status?: string;
                      category?: string;
                      createdAt?: string;
                      authorName?: string;
                      authorGeneration?: number;
                      viewCount?: number;
                      studyTags?: string[];
                      maxMembers?: number;
                      currentMembers?: number;
                      currentMember?: number;
                      currentMemberCount?: number;
                    };
                    const authorDisplay = s.authorName
                      ? s.authorGeneration
                        ? `${s.authorGeneration}기 ${s.authorName}`
                        : s.authorName
                      : "씨부엉 멤버";
                    const currentCount =
                      s.currentMembers ??
                      s.currentMember ??
                      s.currentMemberCount ??
                      0;
                    return (
                      <SDC
                        key={study.id}
                        id={study.id}
                        category={
                          (s.category || s.studyTags?.[0]) as StudyCategory
                        }
                        status={study.status as StudyStatus}
                        title={s.title ?? ""}
                        time={formatDateOnly(s.createdAt)}
                        authorDisplay={authorDisplay}
                        viewCount={(s.viewCount as number) ?? 0}
                        categories={s.studyTags}
                        currentCount={currentCount}
                        maxCount={s.maxMembers}
                      />
                    );
                  })}

                {!isLoading && !isError && studies.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    해당 조건에 맞는 스터디가 없습니다.
                  </div>
                )}
              </div>

              {/* 페이지네이션 */}
              <PGN
                currentPage={currentPage}
                totalPages={pageNumbers}
                onPageChange={(num) => setCurrentPage(num)}
              />
            </div>
          </div>
        </div>
      </main>
    </RequireMember>
  );
}
